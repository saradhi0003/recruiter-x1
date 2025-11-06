
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Rocket, Users, Briefcase } from "lucide-react";
import { Candidate } from "@/entities/Candidate";
import { Job } from "@/entities/Job";
import { InvokeLLM } from "@/integrations/Core";
import { CandidateView } from "@/entities/CandidateView";
import { usePermissions } from "@/components/common/PermissionsContext";

export default function BulkBenchScorer({ open, onClose, onDone }) {
  const [bench, setBench] = React.useState([]);
  const [jobs, setJobs] = React.useState([]);
  const [jobId, setJobId] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState([]);

  const [views, setViews] = React.useState([]);
  const [selectedViewId, setSelectedViewId] = React.useState("");

  const { me, role, isAdmin, listFilterFor } = usePermissions();

  const loadCandidatesForView = React.useCallback(async (view) => {
    const viewFilter = (view?.filters) || { status: "our_bench" };
    const scopeFilter = listFilterFor("Candidate") || {};
    const filter = { ...viewFilter, ...scopeFilter };
    const cand = await Candidate.filter(filter, "-updated_date", 500).catch(() => []);
    setBench(cand || []);
  }, [listFilterFor]);

  // Load views and initial data when opened
  React.useEffect(() => {
    if (!open) return;
    (async () => {
      // UPDATED: include draft and open jobs
      const [openJobs, draftJobs] = await Promise.all([
        Job.filter({ status: "open" }, "-created_date", 300).catch(() => []),
        Job.filter({ status: "draft" }, "-created_date", 300).catch(() => []),
      ]);
      const map = new Map();
      [...(openJobs || []), ...(draftJobs || [])].forEach(j => { if (j) map.set(j.id, j); });
      setJobs(Array.from(map.values()));

      // Load candidate views with new visibility logic
      const list = await CandidateView.list().catch(() => []);
      const myRoleName = (me?.role || "").toLowerCase();
      const myAccessName = (role?.name || "").toLowerCase(); // Assuming role.name holds the string like "Recruiter", "Admin" etc.
      const visible = (list || []).filter(v => {
        if (isAdmin) return true;
        if (v.created_by === me?.email) return true;
        if (v.visibility === "team" || v.visibility === "public") return true;
        if (v.visibility === "role_admin" && myRoleName === "admin") return true;
        if (v.visibility === "role_user" && myRoleName === "user") return true;
        if (v.visibility === "role_recruiter" && myAccessName === "recruiter") return true;
        return false;
      });
      setViews(visible);
      const def = visible.find(v => v.is_default) || null;
      // Use "" to represent "Default: Our Bench" for the Select component
      setSelectedViewId(def ? def.id : "");
      await loadCandidatesForView(def || null); // Pass the actual view object or null for default
    })();
  }, [open, isAdmin, me, role, loadCandidatesForView]);

  // Reload candidates when user changes the selected view
  React.useEffect(() => {
    if (!open) return;
    // Find the actual view object based on selectedViewId
    // If selectedViewId is "", this means the "Default: Our Bench" option, so view will be null
    const view = (views || []).find(v => v.id === selectedViewId) || null;
    loadCandidatesForView(view);
  }, [selectedViewId, views, open, loadCandidatesForView]);

  const run = async () => {
    if (!jobId) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setRunning(true);
    setProgress(0);
    setResults([]);

    const total = bench.length; // Use bench.length directly, not || 1
    let done = 0;

    for (const c of bench) {
      try {
        // NEW: skip candidates without resume
        if (!c.resume_url) {
          setResults(prev => {
            const next = [...prev, { id: c.id, name: `${c.first_name} ${c.last_name}`, score: null, skipped: "no_resume" }];
            // Keep sorting by score, but skipped candidates will effectively be at the bottom with null score
            next.sort((a, b) => (b.score || 0) - (a.score || 0));
            return next;
          });
          done += 1;
          setProgress(Math.round((done / total) * 100));
          // Gentle pacing even for skipped ones to prevent UI from freezing if many skipped
          await new Promise(r => setTimeout(r, 100));
          continue; // Skip LLM invocation for this candidate
        }

        const prompt = `
You are an expert technical recruiter. Score this candidate for the job.
Return JSON only.

Job:
Title: ${job.title}
Description: ${job.description || ""}
Requirements: ${job.requirements || ""}
Required Skills: ${(job.required_skills || []).join(", ")}

Candidate:
Name: ${c.first_name} ${c.last_name}
Current Title: ${c.current_title || ""}
Experience Years: ${c.experience_years || "n/a"}
Key Skills: ${(c.skills || []).join(", ")}
Location: ${c.location || ""}

Respond with:
- match_score (0-100 number)
- summary (string)
- strengths (array of strings)
- gaps (array of strings)
        `.trim();

        const res = await InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              match_score: { type: "number" },
              summary: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              gaps: { type: "array", items: { type: "string" } }
            },
            required: ["match_score", "summary"]
          }
        });

        const score = typeof res?.match_score === "number" ? Math.max(0, Math.min(100, Math.round(res.match_score))) : null;

        // Persist on candidate
        await Candidate.update(c.id, {
          bench_match_score: score,
          bench_score_details: res
        });

        setResults(prev => {
          const next = [...prev, { id: c.id, name: `${c.first_name} ${c.last_name}`, score, details: res }];
          next.sort((a, b) => (b.score || 0) - (a.score || 0));
          return next;
        });
      } catch (e) {
        // Skip on error; continue with next
        setResults(prev => {
          const next = [...prev, { id: c.id, name: `${c.first_name} ${c.last_name}`, score: null, error: true }];
          next.sort((a, b) => (b.score || 0) - (a.score || 0));
          return next;
        });
      } finally {
        done += 1;
        setProgress(Math.round((done / total) * 100));
        // Gentle pacing to avoid rate limits
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setRunning(false);
    onDone?.();
  };

  const handleViewJob = () => {
    if (jobId) {
      window.open(`/job/${jobId}`, "_blank");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Bulk Score Our Bench</h3>
            </div>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border rounded-lg bg-slate-50 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <div className="text-sm"><span className="font-medium">{bench.length}</span> candidates to score</div>
            </div>

            {/* Candidate list view selector */}
            <div>
              <label className="text-sm text-slate-600">Candidate list view</label>
              <Select value={selectedViewId} onValueChange={setSelectedViewId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Default: Our Bench" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Default: Our Bench</SelectItem> {/* Changed value to "" */}
                  {views.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedViewId && (
                <div className="text-xs text-slate-500 mt-1">Using default filter: status = our_bench.</div>
              )}
            </div>

            {/* UPDATED: job selector shows draft + open, and job preview button */}
            <div>
              <label className="text-sm text-slate-600">Score against job</label>
              <div className="flex items-center gap-2 mt-1">
                <Select value={jobId} onValueChange={setJobId}>
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Choose open or draft job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map(j => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.title} {j.status ? `• ${j.status.replace("_", " ")}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleViewJob}
                  disabled={!jobId}
                  title="View job details"
                >
                  <Briefcase className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={run} disabled={!jobId || running || bench.length === 0} className="gap-2">
              {running && <Loader2 className="w-4 h-4 animate-spin" />} Run Scoring
            </Button>
            {running && <div className="flex-1"><Progress value={progress} /></div>}
            {!running && progress > 0 && <Badge variant="secondary">{progress}%</Badge>}
          </div>

          {results.length > 0 && (
            <div className="max-h-[50vh] overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Candidate</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">
                        {r.skipped === "no_resume" ? (
                          <Badge variant="outline" className="bg-slate-100 text-slate-700">Skipped</Badge>
                        ) : typeof r.score === "number" ? (
                          <Badge className={r.score >= 75 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{r.score}</Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-2 text-slate-600">
                        {r.skipped === "no_resume" ? "No resume attached" : (r.details?.summary || (r.error ? "Error scoring" : "—"))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
