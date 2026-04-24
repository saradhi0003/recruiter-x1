import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function callOpenAI(params) {
  const { model = "gpt-4o-mini", systemPrompt = "", userPrompt = "", schema = null } = params;
  
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const payload = {
    model,
    temperature: 0.7,
    max_tokens: 2000,
    messages: [
      { role: "system", content: systemPrompt || "You are a helpful AI recruiter assistant." },
      { role: "user", content: userPrompt },
    ],
  };

  if (schema) {
    payload.response_format = {
      type: "json_schema",
      json_schema: { name: "response", strict: false, schema },
    };
  }

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { source = "manual", source_id = null, raw_text = "", job_id = null } = body;

    if (!raw_text.trim()) {
      return Response.json({ error: "raw_text is required" }, { status: 400 });
    }

    // Parse job with OpenAI
    const parseSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        company: { type: "string" },
        description: { type: "string" },
        requirements: { type: "string" },
        required_skills: { type: "array", items: { type: "string" } },
        preferred_skills: { type: "array", items: { type: "string" } },
        location: { type: "string" },
        remote_type: { type: "string", enum: ["onsite", "remote", "hybrid"] },
        employment_type: { type: "string", enum: ["full_time", "part_time", "contract", "contract_to_hire"] },
        rate: { type: "string" },
        experience_required: { type: "number" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
      },
      required: ["title"],
    };

    const parsed = await callOpenAI({
      model: "gpt-4o-mini",
      systemPrompt: "Extract structured job information from the provided job description or email. Return valid JSON.",
      userPrompt: `Job Description:\n${raw_text}`,
      schema: parseSchema,
    });

    // Create or update Job
    let job;
    if (job_id) {
      job = await base44.entities.Job.update(job_id, {
        title: parsed.title,
        description: parsed.description || "",
        requirements: parsed.requirements || "",
        location: parsed.location || "",
        remote_type: parsed.remote_type || "onsite",
        employment_type: parsed.employment_type || "full_time",
        rate: parsed.rate || "",
        required_skills: parsed.required_skills || [],
        preferred_skills: parsed.preferred_skills || [],
        experience_required: parsed.experience_required || 0,
        priority: parsed.priority || "medium",
      });
    } else {
      // Need company_id for new job - for now use first available company or create placeholder
      const companies = await base44.entities.Company.list("", 1);
      const company_id = companies[0]?.id || "unknown";

      job = await base44.entities.Job.create({
        title: parsed.title,
        company_id,
        description: parsed.description || "",
        requirements: parsed.requirements || "",
        location: parsed.location || "",
        remote_type: parsed.remote_type || "onsite",
        employment_type: parsed.employment_type || "full_time",
        rate: parsed.rate || "",
        required_skills: parsed.required_skills || [],
        preferred_skills: parsed.preferred_skills || [],
        experience_required: parsed.experience_required || 0,
        priority: parsed.priority || "medium",
        status: "draft",
      });
    }

    // Create AIRecruiterRun
    const run = await base44.entities.AIRecruiterRun.create({
      job_id: job.id,
      source,
      source_id,
      status: "parsed",
      model_used: "gpt-4o-mini",
      started_at: new Date().toISOString(),
      summary: `Parsed job: ${job.title}`,
    });

    // Log activity
    await base44.entities.RecruiterActivity.create({
      run_id: run.id,
      entity_type: "job",
      entity_id: job.id,
      activity_type: "ai_job_parsed",
      title: `Job parsed: ${job.title}`,
      description: `AI parsed job description and extracted key requirements`,
      metadata: {
        source,
        skills_found: (parsed.required_skills || []).length,
      },
    });

    return Response.json({
      success: true,
      run_id: run.id,
      job,
      parsed,
    });
  } catch (error) {
    console.error("aiRecruiterParseJob error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});