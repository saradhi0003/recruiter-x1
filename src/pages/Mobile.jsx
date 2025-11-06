import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, Plus } from "lucide-react";
import { Candidate, Job, Task } from "@/entities/all";
import { usePermissions } from "@/components/common/PermissionsContext";
import QuickAddCandidate from "@/components/mobile/QuickAddCandidate";
import MobileTaskItem from "@/components/mobile/MobileTaskItem";
import MobileTabBar from "@/components/mobile/MobileTabBar";

export default function Mobile() {
  const { listFilterFor, me } = usePermissions();
  const [tab, setTab] = React.useState("home");

  const [loading, setLoading] = React.useState(false);
  const [tasks, setTasks] = React.useState([]);
  const [candidates, setCandidates] = React.useState([]);
  const [jobs, setJobs] = React.useState([]);

  const [qCand, setQCand] = React.useState("");
  const [qJobs, setQJobs] = React.useState("");

  const [quickAddOpen, setQuickAddOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    // Scoped filters
    const candF = listFilterFor("Candidate");
    const jobF = listFilterFor("Job");
    // Task visibility: created_by or assigned_to me
    let taskList = await Task.list();
    if (me?.email) {
      taskList = taskList.filter(t => t.created_by === me.email || t.assigned_to === me.email);
    }
    const candList = candF ? await Candidate.filter(candF, "-created_date", 25) : await Candidate.list("-created_date", 25);
    const jobList = jobF ? await Job.filter(jobF, "-created_date", 25) : await Job.list("-created_date", 25);

    // My Tasks Today ordering
    const today = new Date(); today.setHours(0,0,0,0);
    const myTasks = taskList
      .filter(t => ["pending","in_progress"].includes(t.status))
      .filter(t => {
        if (!t.due_date) return true;
        const due = new Date(t.due_date); due.setHours(0,0,0,0);
        return due <= today;
      })
      .sort((a,b) => {
        const da = a.due_date ? new Date(a.due_date) : new Date("9999-12-31");
        const db = b.due_date ? new Date(b.due_date) : new Date("9999-12-31");
        return da - db;
      });

    setTasks(myTasks);
    setCandidates(candList);
    setJobs(jobList);
    setLoading(false);
  }, [listFilterFor, me?.email]);

  React.useEffect(() => { load(); }, [load]);

  const completeTask = async (task) => {
    await Task.update(task.id, { status: "completed", completion_notes: "Completed on Mobile" });
    load();
  };

  const filteredCandidates = candidates.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(qCand.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(qCand.toLowerCase()) ||
    (c.current_title || "").toLowerCase().includes(qCand.toLowerCase())
  );

  const filteredJobs = jobs.filter(j =>
    (j.title || "").toLowerCase().includes(qJobs.toLowerCase()) ||
    (j.location || "").toLowerCase().includes(qJobs.toLowerCase()) ||
    (j.priority || "").toLowerCase().includes(qJobs.toLowerCase())
  );

  return (
    <div className="pb-16"> {/* bottom padding for tab bar */}
      {/* Top bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="text-sm">
          <div className="font-semibold text-slate-900">Hello{me?.full_name ? `, ${me.full_name.split(' ')[0]}` : ""}</div>
          <div className="text-slate-500">Mobile Workspace</div>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={load}>
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Tab content */}
      {tab === "home" && (
        <div className="px-4 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-base">My Tasks Today</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setTab("tasks")}>See all</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? <div className="text-sm text-slate-500">Loading...</div> :
                (tasks.length ? tasks.slice(0,6).map(t => (
                  <MobileTaskItem key={t.id} task={t} onComplete={completeTask} />
                )) : <div className="text-sm text-slate-500">No due tasks today.</div>)
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button className="w-full gap-2" onClick={() => setQuickAddOpen(true)}>
                <Plus className="w-4 h-4" /> Add Candidate
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setTab("candidates")}>Browse Candidates</Button>
              <Button variant="outline" className="w-full" onClick={() => setTab("jobs")}>Browse Jobs</Button>
              <Button variant="outline" className="w-full" onClick={() => setTab("tasks")}>My Tasks</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "candidates" && (
        <div className="px-4 space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Search candidates..." value={qCand} onChange={(e) => setQCand(e.target.value)} />
            <Button onClick={() => setQuickAddOpen(true)}><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2">
            {loading ? <div className="text-sm text-slate-500">Loading...</div> :
              (filteredCandidates.length ? filteredCandidates.slice(0,30).map(c => (
                <div key={c.id} className="p-3 rounded-lg border bg-white">
                  <div className="font-medium text-blue-700">{c.first_name} {c.last_name}</div>
                  <div className="text-xs text-slate-600">{c.email}</div>
                  <div className="text-xs text-slate-600">{c.current_title || "—"}</div>
                </div>
              )) : <div className="text-sm text-slate-500">No results</div>)
            }
          </div>
        </div>
      )}

      {tab === "jobs" && (
        <div className="px-4 space-y-3">
          <Input placeholder="Search jobs..." value={qJobs} onChange={(e) => setQJobs(e.target.value)} />
          <div className="space-y-2">
            {loading ? <div className="text-sm text-slate-500">Loading...</div> :
              (filteredJobs.length ? filteredJobs.slice(0,30).map(j => (
                <div key={j.id} className="p-3 rounded-lg border bg-white">
                  <div className="font-medium text-slate-900">{j.title}</div>
                  <div className="text-xs text-slate-600">Status: {j.status} • Priority: {j.priority}</div>
                  <div className="text-xs text-slate-600">{j.location || "—"}</div>
                </div>
              )) : <div className="text-sm text-slate-500">No results</div>)
            }
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="px-4 space-y-3">
          {loading ? <div className="text-sm text-slate-500">Loading...</div> :
            (tasks.length ? tasks.map(t => <MobileTaskItem key={t.id} task={t} onComplete={completeTask} />) :
              <div className="text-sm text-slate-500">You're all caught up.</div>)
          }
        </div>
      )}

      <QuickAddCandidate
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={load}
      />

      <MobileTabBar value={tab} onChange={setTab} />
    </div>
  );
}