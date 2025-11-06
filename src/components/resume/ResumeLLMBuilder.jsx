import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Sparkles } from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";

export default function ResumeLLMBuilder({ jdText = "", resumeText = "", currentData = {}, onApply }) {
  const [draft, setDraft] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [note, setNote] = React.useState("");

  const schema = {
    type: "object",
    properties: {
      name: { type: "string" },
      headline: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      location: { type: "string" },
      website: { type: "string" },
      linkedin: { type: "string" },
      summary: { type: "string" },
      experiences: {
        type: "array",
        items: {
          type: "object",
          properties: {
            company: { type: "string" },
            role: { type: "string" },
            location: { type: "string" },
            start_date: { type: "string" },
            end_date: { type: "string" },
            bullets: { type: "array", items: { type: "string" } }
          }
        }
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            school: { type: "string" },
            degree: { type: "string" },
            major: { type: "string" },
            gpa: { type: "string" },
            start_date: { type: "string" },
            end_date: { type: "string" },
            details: { type: "array", items: { type: "string" } }
          }
        }
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            date: { type: "string" },
            description: { type: "array", items: { type: "string" } }
          }
        }
      },
      skills: { type: "array", items: { type: "string" } },
      theme_color: { type: "string" }
    }
  };

  const makePrompt = (mode) => {
    const base = `
You are an expert resume writer for top tech roles.
Task: produce a complete, ATS-friendly resume JSON strictly matching the provided JSON schema.
- Use strong action verbs, quantify impact where possible.
- Keep to 1 page content density.
- Include top 20-30 hard skills directly relevant to the JD.
- Keep dates as strings (e.g., "Jan 2022 – Present").
- Avoid hallucinating employers or schools; if unknown, leave blank or infer plausible generic entries.
Return only JSON (no markdown, no commentary).

Inputs:
JD:
${jdText || "(none provided)"}

Existing resume text (if provided):
${resumeText || "(none provided)"} 
${note ? `\nUser notes/preferences:\n${note}\n` : ""}
Mode: ${mode === "rewrite" ? "Rewrite and enhance supplied resume to align strongly to JD; preserve truthful facts but improve wording and structure." : "Create brand new resume aligned to JD; synthesize content professionally if resume is empty."}
`;
    return base;
  };

  const runBuilder = async (mode) => {
    setLoading(true);
    setDraft(null);
    try {
      const res = await InvokeLLM({
        prompt: makePrompt(mode),
        response_json_schema: schema
      });
      // Normalize minimal structure
      const normalized = {
        ...res,
        experiences: Array.isArray(res.experiences) ? res.experiences : [],
        education: Array.isArray(res.education) ? res.education : [],
        projects: Array.isArray(res.projects) ? res.projects : [],
        skills: Array.isArray(res.skills) ? res.skills : []
      };
      setDraft(normalized);
    } finally {
      setLoading(false);
    }
  };

  const applyDraft = () => {
    if (!draft) return;
    onApply?.(draft);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Resume Builder
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={() => runBuilder(resumeText?.trim() ? "rewrite" : "generate")}
            className="gap-2"
            disabled={loading || (!jdText && !resumeText)}
            title="Use JD and/or pasted resume to generate a strong version"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {resumeText?.trim() ? "Enhance From Pasted Resume" : "Generate From JD"}
          </Button>
          <Button
            variant="outline"
            onClick={() => runBuilder("generate")}
            disabled={loading || !jdText}
          >
            Generate Brand New (JD)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium">Optional notes to guide generation</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="E.g., Prefer fintech roles, highlight Python + AWS; shorten older experience."
            rows={2}
          />
        </div>

        {!loading && !draft && (
          <div className="text-sm text-slate-600">
            Tip: Paste a JD on the left panel, and optionally paste a resume in the scorer. Then click Generate.
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating resume draft...
          </div>
        )}

        {draft && (
          <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{draft.name || currentData.name || "—"}</div>
                <div className="text-sm text-slate-600">{draft.headline || "Generated headline"}</div>
              </div>
              <Badge variant="secondary">{(draft.skills || []).length} skills</Badge>
            </div>
            <div className="text-sm text-slate-700 line-clamp-4">{draft.summary}</div>
            <div className="flex gap-2">
              <Button onClick={applyDraft} className="gap-2">
                <Sparkles className="w-4 h-4" /> Apply to Editor
              </Button>
              <Button variant="outline" onClick={() => setDraft(null)}>Discard</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}