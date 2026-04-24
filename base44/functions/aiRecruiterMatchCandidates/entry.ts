import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function callOpenAI(params) {
  const { model = "gpt-4o-mini", systemPrompt = "", userPrompt = "" } = params;
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

  const payload = {
    model,
    temperature: 0.5,
    max_tokens: 1500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `OpenAI error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

function normalizeSkills(skills) {
  return (skills || []).map(s => (typeof s === "string" ? s.toLowerCase().trim() : "")).filter(Boolean);
}

function calculateDeterministicScore(job, candidate) {
  let score = 0;

  // Required skills match (35 points)
  const requiredSkills = normalizeSkills(job.required_skills);
  const candidateSkills = normalizeSkills(candidate.skills);
  if (requiredSkills.length > 0) {
    const matched = requiredSkills.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
    score += (matched.length / requiredSkills.length) * 35;
  }

  // Preferred skills match (15 points)
  const preferredSkills = normalizeSkills(job.preferred_skills);
  if (preferredSkills.length > 0) {
    const matched = preferredSkills.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
    score += (matched.length / preferredSkills.length) * 15;
  }

  // Experience match (15 points)
  if (job.experience_required && candidate.experience_years) {
    if (candidate.experience_years >= job.experience_required) {
      score += 15;
    } else if (candidate.experience_years >= job.experience_required * 0.8) {
      score += 10;
    } else if (candidate.experience_years > 0) {
      score += 5;
    }
  } else if (candidate.experience_years > 0) {
    score += 8;
  }

  // Work authorization (10 points)
  if (candidate.work_authorization && candidate.work_authorization !== "other") {
    score += 10;
  }

  // Availability (10 points)
  if (candidate.availability === "immediately" || candidate.availability === "2_weeks") {
    score += 10;
  } else if (candidate.availability === "1_month") {
    score += 6;
  } else {
    score += 3;
  }

  // Status filter (active/available)
  if (candidate.status && (candidate.status === "active" || candidate.status === "on_bench")) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { job_id, run_id = null, max_candidates = 50, filters = {} } = body;

    if (!job_id) {
      return Response.json({ error: "job_id is required" }, { status: 400 });
    }

    // Load job
    let job;
    try {
      const jobs = await base44.entities.Job.list("-created_date", 100);
      job = jobs.find(j => j.id === job_id);
    } catch (err) {
      console.error("Failed to load job:", err);
      job = null;
    }
    
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Load candidates
    let candidates = [];
    try {
      candidates = await base44.entities.Candidate.list("-created_date", 200);
    } catch (err) {
      console.error("Failed to load candidates:", err);
      candidates = [];
    }

    // Filter candidates
    let filtered = candidates.filter(c => {
      // Status check
      if (c.status === "inactive" || c.status === "do_not_contact") return false;
      // Availability filter
      if (filters.availability && c.availability !== filters.availability) return false;
      // Work auth filter
      if (filters.work_authorization && c.work_authorization !== filters.work_authorization) return false;
      return true;
    });

    // Score all candidates
    const scored = filtered.map(c => ({
      candidate: c,
      deterministicScore: calculateDeterministicScore(job, c),
    })).sort((a, b) => b.deterministicScore - a.deterministicScore);

    // Take top candidates for AI explanation
    const topCandidates = scored.slice(0, Math.min(max_candidates, 15));

    // Get AI explanations for top candidates
    const matches = [];
    for (const item of topCandidates) {
      const { candidate, deterministicScore } = item;

      try {
        const explanation = await callOpenAI({
          model: "gpt-4o-mini",
          systemPrompt: "You are an expert recruiter. Analyze the fit between a job and candidate. Return JSON with: recommendation (strong_submit/maybe/not_recommended), matched_skills, missing_skills, risk_flags (array), strengths, weaknesses, summary, explanation.",
          userPrompt: `Job: ${job.title}, Required: ${(job.required_skills || []).join(", ")}, Preferred: ${(job.preferred_skills || []).join(", ")}. Candidate: ${candidate.first_name} ${candidate.last_name}, Skills: ${(candidate.skills || []).join(", ")}, Experience: ${candidate.experience_years} years, Availability: ${candidate.availability}.`,
        });

        const requiredSkills = normalizeSkills(job.required_skills);
        const candidateSkills = normalizeSkills(candidate.skills);
        const matched = requiredSkills.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
        const missing = requiredSkills.filter(s => !matched.includes(s));

        const result = {
          candidate_id: candidate.id,
          score: Math.min(100, deterministicScore + (explanation.score_adjustment || 0)),
          recommendation: explanation.recommendation || "maybe",
          matched_skills: matched.length > 0 ? matched : (explanation.matched_skills || []),
          missing_skills: missing.length > 0 ? missing : (explanation.missing_skills || []),
          risk_flags: explanation.risk_flags || [],
          strengths: explanation.strengths || [],
          weaknesses: explanation.weaknesses || [],
          ai_summary: explanation.summary || explanation.ai_summary || "",
          explanation: explanation.explanation || "",
          model_used: "gpt-4o-mini",
        };

        // Save to CandidateMatchResult
        const matchResult = await base44.entities.CandidateMatchResult.create({
          run_id: run_id || "temp",
          job_id,
          candidate_id: candidate.id,
          score: result.score,
          recommendation: result.recommendation,
          matched_skills: result.matched_skills,
          missing_skills: result.missing_skills,
          risk_flags: result.risk_flags,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          ai_summary: result.ai_summary,
          explanation: result.explanation,
          model_used: "gpt-4o-mini",
        });

        matches.push(result);
      } catch (error) {
        console.warn(`Failed to get AI explanation for candidate ${candidate.id}:`, error.message);
        // Still include the candidate with deterministic score only
        matches.push({
          candidate_id: candidate.id,
          score: deterministicScore,
          recommendation: "maybe",
          matched_skills: [],
          missing_skills: [],
          risk_flags: ["AI explanation failed"],
          strengths: [],
          weaknesses: [],
          ai_summary: "AI analysis unavailable",
          explanation: "",
          model_used: "deterministic",
        });
      }
    }

    // Sort by final score
    matches.sort((a, b) => b.score - a.score);

    // Update run if provided
    if (run_id) {
      await base44.entities.AIRecruiterRun.update(run_id, {
        status: "matched",
        match_count: matches.length,
      });

      await base44.entities.RecruiterActivity.create({
        run_id,
        entity_type: "job",
        entity_id: job_id,
        activity_type: "ai_candidates_matched",
        title: `Matched ${matches.length} candidates`,
        description: `AI found and ranked ${matches.length} candidates for ${job.title}`,
        metadata: { top_score: matches[0]?.score || 0 },
      });
    }

    return Response.json({
      success: true,
      run_id: run_id || null,
      job_id,
      matches,
    });
  } catch (error) {
    console.error("aiRecruiterMatchCandidates error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});