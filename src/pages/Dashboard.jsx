import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Briefcase, Building2, TrendingUp, ArrowUpRight, ArrowDownRight,
  RefreshCcw, Sparkles, AlertTriangle, CheckCircle2, Loader2, Plus,
  ChevronRight, Circle, Clock, Activity, Brain, Zap, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Candidate, Job, Company, Application, Submission, Task } from "@/entities/all";
import { User as UserEntity } from "@/entities/all";
import { usePermissions } from "@/components/common/PermissionsContext";
import { getRolesCached } from "@/components/utils/rolesCache";
import { InvokeLLM } from "@/integrations/Core";
import { addNotification } from "@/components/notifications/NotificationToast";
import { DashboardConfig } from "@/entities/DashboardConfig";
import WidgetRenderer from "@/components/dashboard/WidgetRenderer";
import BuilderModal from "@/components/dashboard/BuilderModal";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import DataListModal from "@/components/common/DataListModal";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from "recharts";

const STATUS_COLORS = {
  active: "#16A34A", inactive: "#94A3B8", placed: "#2563EB",
  screened: "#D97706", on_bench: "#7C3AED"
};

function KPICard({ title, value, change, changeUp, icon: Icon, sub, onClick, loading }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E2E8F0] rounded-lg p-5 group ${onClick ? "cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#EFF6FF] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#2563EB]" />
          </div>
          <span className="text-[13px] text-[#64748B] font-medium">{title}</span>
        </div>
        {change && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${changeUp ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FFF7ED] text-[#D97706]"}`}>
            {changeUp ? "+" : ""}{change}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 rounded animate-pulse mb-1" />
      ) : (
        <div className="text-[32px] font-semibold text-[#1E293B] leading-none mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {value}
        </div>
      )}
      {sub && <p className="text-[12px] text-[#94A3B8] mt-1">{sub}</p>}
      {onClick && (
        <div className="flex items-center gap-1 text-[12px] text-[#2563EB] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          View details <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}

function PipelineStage({ label, count, avgDays, conversion, isLast }) {
  return (
    <div className="flex items-center">
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 min-w-[120px] hover:border-[#2563EB] hover:shadow-sm transition-all cursor-pointer">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">{label}</div>
        <div className="text-[24px] font-semibold text-[#1E293B]" style={{ fontFamily: 'var(--font-display)' }}>{count}</div>
        <div className="text-[11px] text-[#64748B] mt-1">{avgDays}d avg</div>
        {conversion !== null && (
          <div className="text-[11px] text-[#16A34A] font-medium mt-0.5">{conversion}% →</div>
        )}
      </div>
      {!isLast && (
        <div className="flex items-center mx-1">
          <div className="w-6 h-px bg-[#E2E8F0]" />
          <ChevronRight className="w-3 h-3 text-[#CBD5E1] -ml-1" />
        </div>
      )}
    </div>
  );
}

function AIInsightCard({ icon: Icon, insight, action, color = "blue" }) {
  const colors = {
    blue: { bg: "bg-[#EFF6FF]", icon: "text-[#2563EB]" },
    amber: { bg: "bg-[#FFFBEB]", icon: "text-[#D97706]" },
    green: { bg: "bg-[#F0FDF4]", icon: "text-[#16A34A]" },
    red: { bg: "bg-[#FEF2F2]", icon: "text-[#DC2626]" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="flex gap-3 py-3 border-b border-[#F1F5F9] last:border-0">
      <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-3.5 h-3.5 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#1E293B] leading-snug">{insight}</p>
        {action && (
          <button className="text-[12px] text-[#2563EB] font-medium mt-1 flex items-center gap-1 hover:underline">
            {action} <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalCandidates: 0, activeJobs: 0, totalCompanies: 0, thisMonthPlacements: 0 });
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myTasksToday, setMyTasksToday] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [modal, setModal] = useState({ open: false, title: "", columns: [], rows: [] });
  const [config, setConfig] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiInsights, setAIInsights] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);

  const dashGuard = useRef({ ts: 0, inFlight: false });
  const { listFilterFor } = usePermissions();

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const quarter = `Q${Math.ceil((today.getMonth() + 1) / 3)} ${today.getFullYear()}`;

  const loadDashboardData = useCallback(async (force = false) => {
    const now = Date.now();
    if (dashGuard.current.inFlight) return;
    if (!force && now - dashGuard.current.ts < 30000) return;
    dashGuard.current.inFlight = true;
    setLoading(true);
    try {
      const meUser = await UserEntity.me().catch(() => null);
      setMe(meUser);
      let admin = meUser?.role === "admin";
      if (meUser?.role_id) {
        const roles = await getRolesCached();
        const r = roles.find(it => it.id === meUser.role_id);
        admin = admin || (r?.name || "").toLowerCase() === "admin";
      }
      setIsAdmin(admin);

      const cfgList = await DashboardConfig.filter({ is_global: true, is_active: true }, "-updated_date");
      const cfg = cfgList[0] || null;
      setConfig(cfg);
      setWidgets(cfg?.widgets || []);

      const candFilter = listFilterFor("Candidate");
      const jobFilter = listFilterFor("Job");
      const compFilter = listFilterFor("Company");
      const appFilter = listFilterFor("Application");
      const subFilter = listFilterFor("Submission");
      let taskFilter = !admin && meUser?.email ? { created_by: meUser.email } : null;

      const [candidatesData, jobsData, companiesData, applicationsData, submissionsData, tasks] = await Promise.all([
        candFilter ? Candidate.filter(candFilter) : Candidate.list(),
        jobFilter ? Job.filter(jobFilter) : Job.list(),
        compFilter ? Company.filter(compFilter) : Company.list(),
        appFilter ? Application.filter(appFilter) : Application.list(),
        subFilter ? Submission.filter(subFilter) : Submission.list(),
        taskFilter ? Task.filter(taskFilter) : Task.list()
      ]);

      setCandidates(candidatesData || []);
      setJobs(jobsData || []);
      setCompanies(companiesData || []);
      setApplications(applicationsData || []);
      setSubmissions(submissionsData || []);

      const activeJobs = jobsData.filter(j => j.status === "open").length;
      const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0);
      const thisMonthPlacements = applicationsData.filter(a => {
        if (a.status !== "hired") return false;
        const d = new Date(a.created_date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }).length;
      setStats({ totalCandidates: candidatesData.length, activeJobs, totalCompanies: companiesData.length, thisMonthPlacements });

      const my = (tasks || [])
        .filter(t => ["pending", "in_progress"].includes(t.status))
        .filter(t => !t.due_date || new Date(t.due_date).setHours(0,0,0,0) <= todayMidnight.getTime())
        .sort((a, b) => {
          const da = a.due_date ? new Date(a.due_date) : new Date("9999");
          const db = b.due_date ? new Date(b.due_date) : new Date("9999");
          return da - db;
        });
      setMyTasksToday(my);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
    setLoading(false);
    dashGuard.current.inFlight = false;
    dashGuard.current.ts = Date.now();
  }, [listFilterFor]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  const completeTask = async (taskId) => {
    setCompletingTask(taskId);
    try {
      await Task.update(taskId, { status: "completed", completion_notes: "Completed from Dashboard" });
      setMyTasksToday(prev => prev.filter(t => t.id !== taskId));
    } catch (err) { console.error(err); }
    setCompletingTask(null);
  };

  const saveGlobalDashboard = async (dash) => {
    let saved = config?.id
      ? await DashboardConfig.update(config.id, { ...dash, is_global: true, is_active: true })
      : await DashboardConfig.create({ ...dash, is_global: true, is_active: true });
    setConfig(saved);
    setWidgets(saved.widgets || []);
    setBuilderOpen(false);
  };

  const onWidgetDragEnd = async ({ destination, source }) => {
    if (!destination || destination.index === source.index) return;
    const arr = Array.from(widgets);
    const [moved] = arr.splice(source.index, 1);
    arr.splice(destination.index, 0, moved);
    setWidgets(arr);
    if (isAdmin && config?.id) await DashboardConfig.update(config.id, { ...config, widgets: arr });
  };

  const openModalFor = (type) => {
    const fmt = d => d ? new Date(d).toLocaleDateString() : "—";
    if (type === "candidates") {
      setModal({ open: true, title: "All Candidates", columns: [
        { key: "name", label: "Name" }, { key: "status", label: "Status" }, { key: "location", label: "Location" }
      ], rows: candidates.map(c => ({ name: `${c.first_name} ${c.last_name}`, status: c.status?.replace("_"," "), location: c.location || "—" })) });
    } else if (type === "jobs") {
      setModal({ open: true, title: "Active Jobs", columns: [
        { key: "title", label: "Title" }, { key: "company", label: "Company" }, { key: "status", label: "Status" }, { key: "priority", label: "Priority" }
      ], rows: jobs.map(j => ({ title: j.title, company: companies.find(c => c.id === j.company_id)?.name || "—", status: j.status?.replace("_"," "), priority: j.priority })) });
    } else if (type === "companies") {
      setModal({ open: true, title: "All Companies", columns: [
        { key: "name", label: "Company" }, { key: "industry", label: "Industry" }, { key: "status", label: "Status" }
      ], rows: companies.map(co => ({ name: co.name, industry: co.industry || "—", status: co.status || "—" })) });
    } else if (type === "hires") {
      setModal({ open: true, title: "This Month's Placements", columns: [
        { key: "candidate", label: "Candidate" }, { key: "job", label: "Job" }, { key: "date", label: "Date" }
      ], rows: applications.filter(a => a.status === "hired").map(a => ({
        candidate: (() => { const c = candidates.find(x => x.id === a.candidate_id); return c ? `${c.first_name} ${c.last_name}` : "—"; })(),
        job: jobs.find(j => j.id === a.job_id)?.title || "—",
        date: fmt(a.created_date)
      })) });
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzingAI(true);
    try {
      const dataSummary = {
        candidates: { total: candidates.length, by_status: candidates.reduce((a, c) => { a[c.status] = (a[c.status]||0)+1; return a; }, {}) },
        jobs: { total: jobs.length, open: jobs.filter(j => j.status === "open").length },
        applications: { total: applications.length, hired: applications.filter(a => a.status === "hired").length }
      };
      const r = await InvokeLLM({
        prompt: `Recruitment pipeline data: ${JSON.stringify(dataSummary)}. Give 4 concise, actionable insights for a recruiter. Each should be 1 sentence identifying a specific issue or opportunity.`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: { type: "array", items: { type: "object", properties: { text: { type: "string" }, type: { type: "string", enum: ["warning","success","info","urgent"] }, action: { type: "string" } } } },
            summary: { type: "string" }
          }
        }
      });
      setAIInsights(r);
      addNotification({ type: "success", title: "AI Analysis Complete", message: "Insights ready" });
    } catch (err) {
      console.error(err);
      addNotification({ type: "error", message: "Failed to generate insights" });
    }
    setAnalyzingAI(false);
  };

  // Pipeline stage data
  const pipelineStages = [
    { label: "Sourced", count: candidates.filter(c => c.status === "active").length, avgDays: 2, conversion: 68 },
    { label: "Screened", count: candidates.filter(c => c.status === "screened").length, avgDays: 3, conversion: 54 },
    { label: "Interviewing", count: applications.filter(a => a.status === "interviewing").length, avgDays: 8, conversion: 71 },
    { label: "Submitted", count: submissions.filter(s => s.status === "submitted").length, avgDays: 5, conversion: 45 },
    { label: "Offer", count: applications.filter(a => a.status === "offered").length, avgDays: 4, conversion: 82 },
    { label: "Placed", count: stats.thisMonthPlacements, avgDays: 0, conversion: null },
  ];

  // Chart data
  const statusChartData = Object.entries(
    candidates.reduce((a, c) => { a[c.status] = (a[c.status]||0)+1; return a; }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g," "), value }));

  const CHART_COLORS = ["#2563EB","#16A34A","#D97706","#DC2626","#7C3AED","#0891B2"];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "pipeline", label: "Pipeline" },
    { id: "activity", label: "Activity" },
  ];

  const insightTypeMap = {
    warning: { icon: AlertTriangle, color: "amber" },
    success: { icon: CheckCircle2, color: "green" },
    urgent: { icon: AlertTriangle, color: "red" },
    info: { icon: Activity, color: "blue" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'var(--font-display)' }}>
            Dashboard
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">{dateLabel} · {quarter}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-[13px] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
            onClick={() => { setRefreshKey(k => k+1); loadDashboardData(true); }}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-[13px] border-[#E2E8F0] text-[#475569]"
              onClick={() => setBuilderOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Customize
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1.5 text-[13px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-0"
            onClick={runAIAnalysis}
            disabled={analyzingAI}
          >
            {analyzingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
            {analyzingAI ? "Analyzing..." : "AI Insights"}
          </Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-0 border-b border-[#E2E8F0]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Candidates" value={stats.totalCandidates} change="vs last month" changeUp icon={Users} sub="All pipeline stages" onClick={() => openModalFor("candidates")} loading={loading} />
            <KPICard title="Active Pipelines" value={stats.activeJobs} changeUp icon={Briefcase} sub="Open positions" onClick={() => openModalFor("jobs")} loading={loading} />
            <KPICard title="Client Companies" value={stats.totalCompanies} changeUp icon={Building2} sub="Active accounts" onClick={() => openModalFor("companies")} loading={loading} />
            <KPICard title="Placements This Month" value={stats.thisMonthPlacements} changeUp icon={TrendingUp} sub="Successful hires" onClick={() => openModalFor("hires")} loading={loading} />
          </div>

          {/* Main content + AI rail */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              {/* Pipeline Overview */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#1E293B]">Pipeline Overview</h2>
                    <p className="text-[12px] text-[#94A3B8] mt-0.5">Recruitment funnel · All active positions</p>
                  </div>
                  <Link to={createPageUrl("Submissions")} className="text-[12px] text-[#2563EB] flex items-center gap-1 hover:underline">
                    Full Pipeline <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex items-start gap-1 flex-wrap">
                  {pipelineStages.map((stage, idx) => (
                    <PipelineStage key={stage.label} {...stage} isLast={idx === pipelineStages.length - 1} />
                  ))}
                </div>
              </div>

              {/* Tasks Today */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#1E293B]">Tasks Today</h2>
                    <p className="text-[12px] text-[#94A3B8]">{myTasksToday.length} pending</p>
                  </div>
                  <Link to={createPageUrl("Tasks")}>
                    <Button variant="outline" size="sm" className="text-[12px] border-[#E2E8F0] gap-1">
                      View All <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                {loading ? (
                  <div className="p-5 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
                  </div>
                ) : myTasksToday.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                    <p className="text-[13px] text-[#64748B]">No tasks due today. You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1F5F9]">
                    {myTasksToday.slice(0, 8).map(t => {
                      const isOverdue = t.due_date && new Date(t.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                      const priorityDot = { urgent: "bg-[#DC2626]", high: "bg-[#D97706]", medium: "bg-[#2563EB]", low: "bg-[#94A3B8]" };
                      return (
                        <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFC] group transition-colors">
                          <button
                            onClick={() => completeTask(t.id)}
                            disabled={completingTask === t.id}
                            className="w-4 h-4 rounded border-2 border-[#CBD5E1] hover:border-[#2563EB] flex items-center justify-center flex-shrink-0 transition-colors"
                          >
                            {completingTask === t.id && <Loader2 className="w-2.5 h-2.5 animate-spin text-[#2563EB]" />}
                          </button>
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[t.priority] || priorityDot.medium}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-medium truncate ${isOverdue ? "text-[#DC2626]" : "text-[#1E293B]"}`}>{t.title}</p>
                            {t.due_date && (
                              <p className={`text-[11px] ${isOverdue ? "text-[#DC2626]" : "text-[#94A3B8]"}`}>
                                Due {new Date(t.due_date).toLocaleDateString()}
                                {isOverdue && " · Overdue"}
                              </p>
                            )}
                          </div>
                          {t.related_entity && (
                            <span className="text-[11px] text-[#94A3B8] hidden group-hover:inline capitalize">{t.related_entity.replace("_"," ")}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Candidates by Status Chart */}
              {!loading && statusChartData.length > 0 && (
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-5">
                  <h2 className="text-[15px] font-semibold text-[#1E293B] mb-4">Candidates by Status</h2>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData} barSize={28}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12 }} />
                        <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Custom Widgets */}
              {widgets && widgets.length > 0 && (
                isAdmin ? (
                  <DragDropContext onDragEnd={onWidgetDragEnd}>
                    <Droppable droppableId="dash-widgets" direction="horizontal">
                      {(drop) => (
                        <div ref={drop.innerRef} {...drop.droppableProps} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {widgets.map((w, idx) => (
                            <Draggable key={w.id} draggableId={w.id} index={idx}>
                              {(drag) => (
                                <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                                  <WidgetRenderer widget={w} refreshKey={refreshKey} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {drop.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {widgets.map(w => <WidgetRenderer key={w.id} widget={w} refreshKey={refreshKey} />)}
                  </div>
                )
              )}
            </div>

            {/* AI Insights Rail */}
            <div className="space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-lg">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-[#1E293B]">AI Insights</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                      <span className="text-[11px] text-[#94A3B8]">Active</span>
                    </div>
                  </div>
                  <Brain className="w-4 h-4 text-[#2563EB]" />
                </div>

                <div className="p-4">
                  {analyzingAI ? (
                    <div className="py-6 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto mb-2" />
                      <p className="text-[12px] text-[#64748B]">Analyzing pipeline...</p>
                    </div>
                  ) : aiInsights?.insights ? (
                    aiInsights.insights.map((ins, i) => {
                      const map = insightTypeMap[ins.type] || insightTypeMap.info;
                      return <AIInsightCard key={i} icon={map.icon} color={map.color} insight={ins.text} action={ins.action} />;
                    })
                  ) : (
                    <div className="space-y-0">
                      <AIInsightCard icon={AlertTriangle} color="amber" insight="Click 'AI Insights' to analyze your pipeline and get personalized recommendations." action="Run Analysis" />
                      <AIInsightCard icon={Users} color="blue" insight={`${candidates.filter(c=>c.status==="active").length} active candidates in your pipeline`} action="View Candidates" />
                      <AIInsightCard icon={Briefcase} color="green" insight={`${stats.activeJobs} open positions currently recruiting`} action="View Jobs" />
                      <AIInsightCard icon={TrendingUp} color="blue" insight={`${stats.thisMonthPlacements} placements made this month`} action="View Placements" />
                    </div>
                  )}
                </div>

                {aiInsights && (
                  <div className="px-4 py-3 border-t border-[#F1F5F9]">
                    <p className="text-[11px] text-[#94A3B8]">Last analyzed: just now</p>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <h3 className="text-[13px] font-semibold text-[#1E293B] mb-3">Quick Actions</h3>
                <div className="space-y-1">
                  {[
                    { label: "Add Candidate", to: "Candidates", icon: Users },
                    { label: "Post New Job", to: "Jobs", icon: Briefcase },
                    { label: "Add Company", to: "Companies", icon: Building2 },
                    { label: "Create Task", to: "Tasks", icon: CheckCircle2 },
                  ].map(item => (
                    <Link key={item.label} to={createPageUrl(item.to)} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[13px] text-[#475569] hover:text-[#1E293B] transition-colors group">
                      <item.icon className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB]" />
                      {item.label}
                      <ChevronRight className="w-3 h-3 ml-auto text-[#CBD5E1] group-hover:text-[#2563EB]" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-6">
          <h2 className="text-[15px] font-semibold text-[#1E293B] mb-4">Full Pipeline View</h2>
          <div className="flex items-start gap-2 flex-wrap mb-8">
            {pipelineStages.map((stage, idx) => (
              <PipelineStage key={stage.label} {...stage} isLast={idx === pipelineStages.length - 1} />
            ))}
          </div>
          <Link to={createPageUrl("Submissions")}>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px]">
              Open Full Pipeline View <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-6">
          <h2 className="text-[15px] font-semibold text-[#1E293B] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[...candidates].sort((a,b) => new Date(b.created_date)-new Date(a.created_date)).slice(0,10).map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
                <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[11px] font-semibold text-[#2563EB] flex-shrink-0">
                  {c.first_name?.[0]}{c.last_name?.[0]}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1E293B]">{c.first_name} {c.last_name} added</p>
                  <p className="text-[11px] text-[#94A3B8]">{new Date(c.created_date).toLocaleDateString()}</p>
                </div>
                <Badge className="ml-auto text-[11px] bg-[#F0FDF4] text-[#16A34A] border-0">{c.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <BuilderModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        initial={config || { name: "Global Dashboard", description: "", widgets: [] }}
        onSave={saveGlobalDashboard}
      />
      <DataListModal
        open={modal.open}
        title={modal.title}
        columns={modal.columns}
        rows={modal.rows}
        onClose={() => setModal({ open: false, title: "", columns: [], rows: [] })}
      />
    </div>
  );
}