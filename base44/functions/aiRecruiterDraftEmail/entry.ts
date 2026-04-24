import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function callOpenAI(params) {
  const { model = "gpt-4o", systemPrompt = "", userPrompt = "" } = params;
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

  const payload = {
    model,
    temperature: 0.8,
    max_tokens: 2000,
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
  return data.choices?.[0]?.message?.content || "";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { run_id, job_id, candidate_ids = [], draft_type = "client_submission", to_email = "", tone = "professional", channel = "app" } = body;

    if (!job_id || candidate_ids.length === 0) {
      return Response.json({ error: "job_id and candidate_ids are required" }, { status: 400 });
    }

    // Load job
    const jobs = await base44.entities.Job.list("", 1);
    const job = jobs.find(j => j.id === job_id);
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Load candidates
    const allCandidates = await base44.entities.Candidate.list("", 500);
    const candidates = allCandidates.filter(c => candidate_ids.includes(c.id));

    // Build candidate details
    const candidateDetails = candidates.map(c => ({
      name: `${c.first_name} ${c.last_name}`,
      title: c.current_title || "Not provided",
      company: c.current_company || "Not provided",
      location: c.location || "Not provided",
      experience: c.experience_years ? `${c.experience_years} years` : "Not provided",
      skills: (c.skills || []).join(", ") || "Not provided",
      availability: c.availability || "Not provided",
      rate: c.salary_expectation ? `$${c.salary_expectation.toLocaleString()}` : "Not provided",
    }));

    // Generate email
    let emailPrompt = "";
    let systemPrompt = "You are an expert recruiter writing professional emails.";

    if (draft_type === "client_submission") {
      systemPrompt += " Write a compelling email to a hiring manager presenting candidate(s). Be concise and highlight key qualifications.";
      emailPrompt = `Job: ${job.title} at ${job.location || "Remote"}. Required skills: ${(job.required_skills || []).join(", ")}. 
      Candidates to present: ${JSON.stringify(candidateDetails, null, 2)}.
      Generate subject line and email body. Tone: ${tone}. 
      Return JSON with fields: subject, body (never invent missing info, use "details available on request" if needed)`;
    } else if (draft_type === "candidate_outreach") {
      systemPrompt += " Write personalized outreach emails to candidates about job opportunities.";
      emailPrompt = `Job: ${job.title} at ${job.location || "Remote"}. Job description summary: ${job.description ? job.description.substring(0, 300) : "Available upon request"}.
      Candidate: ${candidateDetails[0]?.name}. 
      Generate subject line and email body. Tone: ${tone}. 
      Return JSON with fields: subject, body`;
    } else if (draft_type === "follow_up") {
      systemPrompt += " Write a professional follow-up email.";
      emailPrompt = `Job: ${job.title}. Candidate: ${candidateDetails[0]?.name}.
      Generate subject line and polite follow-up email body. Keep it brief. Tone: ${tone}.
      Return JSON with fields: subject, body`;
    }

    const emailContent = await callOpenAI({
      model: "gpt-4o",
      systemPrompt,
      userPrompt: emailPrompt,
    });

    let emailSubject = "";
    let emailBody = "";
    try {
      const parsed = JSON.parse(emailContent);
      emailSubject = parsed.subject || "";
      emailBody = parsed.body || "";
    } catch {
      // If not JSON, try to extract
      const lines = emailContent.split("\n");
      emailSubject = lines[0] || "Job Opportunity";
      emailBody = emailContent;
    }

    // Save draft
    const draft = await base44.entities.EmailDraft.create({
      run_id: run_id || "temp",
      job_id,
      candidate_ids,
      draft_type,
      channel,
      to_email,
      subject: emailSubject,
      body: emailBody,
      status: "draft",
      created_by_ai: true,
      model_used: "gpt-4o",
    });

    // Log activity
    if (run_id) {
      await base44.entities.AIRecruiterRun.update(run_id, {
        status: "draft_created",
        draft_count: (await base44.entities.EmailDraft.filter({ run_id }, "", 100)).length,
      });

      await base44.entities.RecruiterActivity.create({
        run_id,
        entity_type: "email",
        entity_id: draft.id,
        activity_type: "ai_email_draft_created",
        title: `Email draft created: ${draft_type}`,
        description: `Generated ${draft_type} email for ${candidates.length} candidate(s)`,
        metadata: { draft_id: draft.id, recipient_count: 1 },
      });
    }

    return Response.json({
      success: true,
      draft: {
        id: draft.id,
        subject: emailSubject,
        body: emailBody,
        status: "draft",
        to_email,
        draft_type,
      },
    });
  } catch (error) {
    console.error("aiRecruiterDraftEmail error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});