
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCcw,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Candidate, Job, Company, Application, Submission, Task } from "@/entities/all";
import { User as UserEntity } from "@/entities/all";
import PageHeader from "@/components/common/PageHeader";
import { usePermissions } from "@/components/common/PermissionsContext";
import { getRolesCached } from "@/components/utils/rolesCache";
import { InvokeLLM } from "@/integrations/Core";
import { addNotification } from "@/components/notifications/NotificationToast";

import { SkeletonStat, SkeletonCard } from "@/components/common/SkeletonLoader";
import Breadcrumbs from "@/components/common/Breadcrumbs";

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from "recharts";

import DataListModal from "@/components/common/DataListModal";
import WidgetRenderer from "@/components/dashboard/WidgetRenderer";
import BuilderModal from "@/components/dashboard/BuilderModal";
import { DashboardConfig } from "@/entities/DashboardConfig";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import CandidateWorkflowAgent from "../components/ai/CandidateWorkflowAgent";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const StatCard = ({ title, value, change, changeType, icon: Icon, trend, onClick }) => {
  // Enhanced gradient backgrounds for each metric type
  const gradients = {
    candidates: "from-blue-500 via-blue-600 to-blue-700",
    jobs: "from-purple-500 via-purple-600 to-purple-700",
    companies: "from-emerald-500 via-emerald-600 to-emerald-700",
    placements: "from-orange-500 via-orange-600 to-orange-700"
  };
  
  const getGradient = () => {
    if (title.includes("Candidate")) return gradients.candidates;
    if (title.includes("Job")) return gradients.jobs;
    if (title.includes("Compan")) return gradients.companies;
    if (title.includes("Placement")) return gradients.placements;
    return gradients.candidates;
  };

  return (
    <Card 
      className={`relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-90`} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/90">{title}</p>
            <CardTitle className="text-4xl font-bold mt-3 text-white drop-shadow-lg">
              {value}
            </CardTitle>
          </div>
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Icon className="w-7 h-7 text-white drop-shadow" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-center gap-2 text-sm">
          {changeType === 'up' ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <ArrowUpRight className="w-4 h-4 text-white" />
              <span className="font-semibold text-white">{change}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <ArrowDownRight className="w-4 h-4 text-white" />
              <span className="font-semibold text-white">{change}</span>
            </div>
          )}
          <span className="text-white/80">{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    totalCompanies: 0,
    thisMonthPlacements: 0
  });
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [myTasksToday, setMyTasksToday] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  const [modal, setModal] = useState({ open: false, title: "", columns: [], rows: [] });
  const [config, setConfig] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  const dashGuard = useRef({ ts: 0, inFlight: false });
  const { listFilterFor } = usePermissions();

  const loadDashboardData = useCallback(async (force = false) => {
    const now = Date.now();
    if (dashGuard.current.inFlight) return;
    if (!force && now - dashGuard.current.ts < 30000) return;
    dashGuard.current.inFlight = true;

    setLoading(true);
    try {
      const meUser = await UserEntity.me().catch(() => null);
      setMe(meUser);

      let admin = (meUser?.role === "admin");
      if (meUser?.role_id) {
        const roles = await getRolesCached();
        const r = roles.find((it) => it.id === meUser.role_id);
        admin = admin || ((r?.name || "").toLowerCase() === "admin");
      }
      setIsAdmin(admin);

      const cfgList = await DashboardConfig.filter({ is_global: true, is_active: true }, "-updated_date");
      const cfg = cfgList[0] || null;
      setConfig(cfg || null);
      setWidgets(cfg?.widgets || []);

      const candFilter = listFilterFor("Candidate");
      const jobFilter = listFilterFor("Job");
      const compFilter = listFilterFor("Company");
      const appFilter = listFilterFor("Application");
      const subFilter = listFilterFor("Submission");
      
      let taskFilter = null;
      if (!admin && meUser?.email) {
        taskFilter = { created_by: meUser.email };
      }

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

      const activeJobs = jobsData.filter(job => job.status === 'open').length;
      const thisMonthPlacements = applicationsData.filter(app => {
        const placementDate = new Date(app.created_date);
        const thisMonth = new Date();
        return app.status === 'hired' &&
               placementDate.getMonth() === thisMonth.getMonth() &&
               placementDate.getFullYear() === thisMonth.getFullYear();
      }).length;

      setStats({
        totalCandidates: candidatesData.length,
        activeJobs,
        totalCompanies: companiesData.length,
        thisMonthPlacements
      });

      const today = new Date(); 
      today.setHours(0,0,0,0);
      const my = tasks
        .filter(t => ["pending","in_progress"].includes(t.status))
        .filter(t => {
          if (!t.due_date) return true;
          const dueDate = new Date(t.due_date); 
          dueDate.setHours(0,0,0,0);
          return dueDate <= today;
        })
        .sort((a,b) => {
          const dateA = a.due_date ? new Date(a.due_date) : new Date("9999-12-31");
          const dateB = b.due_date ? new Date(b.due_date) : new Date("9999-12-31");
          return dateA.getTime() - dateB.getTime();
        });
      setMyTasksToday(my);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
    dashGuard.current.inFlight = false;
    dashGuard.current.ts = Date.now();
  }, [listFilterFor]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const saveGlobalDashboard = async (dash) => {
    let saved = null;
    if (config?.id) {
      saved = await DashboardConfig.update(config.id, { ...dash, is_global: true, is_active: true });
    } else {
      saved = await DashboardConfig.create({ ...dash, is_global: true, is_active: true });
    }
    setConfig(saved);
    setWidgets(saved.widgets || []);
    setBuilderOpen(false);
  };

  const onWidgetDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;
    const arr = Array.from(widgets);
    const [moved] = arr.splice(source.index, 1);
    arr.splice(destination.index, 0, moved);
    setWidgets(arr);
    if (isAdmin && config?.id) {
      await DashboardConfig.update(config.id, { ...config, widgets: arr });
    }
  };

  const completeTask = async (taskId) => {
    try {
      await Task.update(taskId, { status: "completed", completion_notes: "Completed from Dashboard" });
      loadDashboardData();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const openModalFor = (type) => {
    const fmt = (d) => d ? new Date(d).toLocaleDateString() : "—";
    if (type === "candidates") {
      const rows = candidates.map(c => ({
        name: `${c.first_name} ${c.last_name}`,
        email: c.email,
        status: c.status?.replace("_"," "),
        location: c.location || "—"
      }));
      setModal({ open: true, title: "All Candidates", columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "status", label: "Status" },
        { key: "location", label: "Location" }
      ], rows });
      return;
    }
    if (type === "jobs") {
      const rows = jobs.map(j => {
        const comp = companies.find(c => c.id === j.company_id);
        return {
          title: j.title,
          company: comp ? comp.name : "—",
          status: j.status?.replace("_"," "),
          priority: j.priority,
          due: fmt(j.due_date)
        };
      });
      setModal({ open: true, title: "All Jobs", columns: [
        { key: "title", label: "Title" },
        { key: "company", label: "Company" },
        { key: "status", label: "Status" },
        { key: "priority", label: "Priority" },
        { key: "due", label: "Due Date" }
      ], rows });
      return;
    }
    if (type === "companies") {
      const rows = companies.map(co => ({
        name: co.name,
        industry: co.industry || "—",
        status: co.status || "—",
        open_jobs: jobs.filter(j => j.company_id === co.id && j.status === "open").length
      }));
      setModal({ open: true, title: "All Companies", columns: [
        { key: "name", label: "Company" },
        { key: "industry", label: "Industry" },
        { key: "status", label: "Status" },
        { key: "open_jobs", label: "Open Jobs" }
      ], rows });
      return;
    }
    if (type === "hires") {
      const rows = applications.filter(a => a.status === "hired").map(a => {
        const cand = candidates.find(c => c.id === a.candidate_id);
        const job = jobs.find(j => j.id === a.job_id);
        return {
          candidate: cand ? `${cand.first_name} ${cand.last_name}` : "—",
          job: job ? job.title : "—",
          hired_on: fmt(a.created_date)
        };
      });
      setModal({ open: true, title: "Recent Hires", columns: [
        { key: "candidate", label: "Candidate" },
        { key: "job", label: "Job" },
        { key: "hired_on", label: "Hired On" }
      ], rows });
      return;
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzingAI(true);
    try {
      const getTopSkills = (cands, limit) => {
        const skillsCount = {};
        cands.forEach(c => {
          (c.skills || []).forEach(skill => {
            skillsCount[skill] = (skillsCount[skill] || 0) + 1;
          });
        });
        return Object.entries(skillsCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([skill, count]) => ({ skill, count }));
      };

      const getTopJobSkills = (jbs, limit) => {
        const skillsCount = {};
        jbs.forEach(j => {
          (j.required_skills || []).forEach(skill => {
            skillsCount[skill] = (skillsCount[skill] || 0) + 1;
          });
        });
        return Object.entries(skillsCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([skill, count]) => ({ skill, count }));
      };

      const dataSummary = {
        candidate_stats: {
          total: candidates.length,
          by_status: candidates.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
          }, {}),
          by_source: candidates.reduce((acc, c) => {
            const source = c.source || "unknown";
            acc[source] = (acc[source] || 0) + 1;
            return acc;
          }, {}),
          top_skills: getTopSkills(candidates, 20),
          average_experience: candidates.reduce((sum, c) => sum + (c.experience_years || 0), 0) / (candidates.length || 1)
        },
        job_stats: {
          total: jobs.length,
          by_status: jobs.reduce((acc, j) => {
            acc[j.status] = (acc[j.status] || 0) + 1;
            return acc;
          }, {}),
          open_positions: jobs.filter(j => j.status === "open").length,
          top_required_skills: getTopJobSkills(jobs, 20),
          average_experience_required: jobs.reduce((sum, j) => sum + (j.experience_required || 0), 0) / (jobs.length || 1)
        },
        application_stats: {
          total: applications.length,
          by_status: applications.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
          }, {})
        }
      };

      const response = await InvokeLLM({
        prompt: `You are an expert talent acquisition analyst. Analyze the following recruitment pipeline data and provide strategic insights:

**Data Summary:**
${JSON.stringify(dataSummary, null, 2)}

Provide a comprehensive analysis including:

1.  **Skill Gap Analysis:**
    - Critical skill shortages
    - Sourcing priorities

2.  **Hiring Forecast:**
    - Predicted hiring needs for next 3 months
    - Roles that will be hardest to fill

3.  **Pipeline Health:**
    - Overall health (healthy/at_risk/critical)
    - Bottlenecks
    - Recommendations

4.  **Action Items:**
    - Prioritized immediate actions

Be specific, data-driven, and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            skill_gaps: {
              type: "object",
              properties: {
                critical_gaps: { type: "array", items: { type: "string" } },
                recommendations: { type: "string" }
              }
            },
            hiring_forecast: {
              type: "object",
              properties: {
                predicted_hires_next_month: { type: "number" },
                predicted_hires_quarter: { type: "number" },
                hardest_to_fill_roles: { type: "array", items: { type: "string" } },
                recommendations: { type: "string" }
              }
            },
            pipeline_health: {
              type: "object",
              properties: {
                overall_status: { type: "string", enum: ["healthy", "at_risk", "critical"] },
                bottlenecks: { type: "array", items: { type: "string" } },
                strengths: { type: "array", items: { type: "string" } },
                recommendations: { type: "string" }
              }
            },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  action: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            executive_summary: { type: "string" }
          },
          required: ["skill_gaps", "hiring_forecast", "pipeline_health", "action_items", "executive_summary"]
        }
      });

      setAIInsights(response);
      setShowAIInsights(true);
      addNotification({ type: "success", title: "Analysis Complete", message: "AI insights generated" });
    } catch (error) {
      console.error("Error running AI analysis:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to generate insights" });
    }
    setAnalyzingAI(false);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800"
    };
    return colors[priority] || colors.medium;
  };

  const getHealthBadge = (status) => {
    const colors = {
      healthy: "bg-green-100 text-green-800",
      at_risk: "bg-yellow-100 text-yellow-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.at_risk;
  };

  const candidatesByStatus = candidates.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const jobsByStatus = jobs.reduce((acc, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(candidatesByStatus).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value
  }));

  const jobStatusData = Object.entries(jobsByStatus).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value
  }));

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <Breadcrumbs items={[{ label: "Dashboard" }]} />
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Here's your recruitment overview."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your recruitment overview."
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => { setRefreshKey((k) => k + 1); loadDashboardData(true); }}
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </Button>
            {isAdmin && (
              <Button variant="outline" className="gap-2" onClick={() => setBuilderOpen(true)}>
                <Plus className="w-4 h-4" />
                Customize
              </Button>
            )}
          </div>
        }
      />

      {/* AI Workflow Agent */}
      <CandidateWorkflowAgent />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates}
          change="+12%"
          changeType="up"
          icon={Users}
          trend="vs last month"
          onClick={() => openModalFor("candidates")}
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          change="+8%"
          changeType="up"
          icon={Briefcase}
          trend="vs last month"
          onClick={() => openModalFor("jobs")}
        />
        <StatCard
          title="Client Companies"
          value={stats.totalCompanies}
          change="+5%"
          changeType="up"
          icon={Building2}
          trend="vs last month"
          onClick={() => openModalFor("companies")}
        />
        <StatCard
          title="Placements This Month"
          value={stats.thisMonthPlacements}
          change="+25%"
          changeType="up"
          icon={TrendingUp}
          trend="vs last month"
          onClick={() => openModalFor("hires")}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">My Tasks Today</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={runAIAnalysis}
            disabled={analyzingAI}
            className="gap-2"
          >
            {analyzingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Insights
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {me ? (
            myTasksToday.length ? (
              myTasksToday.slice(0, 8).map(t => {
                const overdue = t.due_date && (new Date(t.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0));
                return (
                  <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
                    <input
                      type="checkbox"
                      className="mt-1"
                      onChange={() => completeTask(t.id)}
                      title="Mark complete"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-slate-900 truncate ${overdue ? "text-red-600" : ""}`}>{t.title}</p>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-2">
                        {t.due_date && <span>Due: {new Date(t.due_date).toLocaleDateString()}</span>}
                        {t.priority && <span className="capitalize">Priority: {t.priority.replace("_", " ")}</span>}
                        {t.related_entity && <span>Related: {t.related_entity.replace("_", " ")}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-600">You have no due tasks today.</div>
            )
          ) : (
            <div className="text-sm text-slate-600">Sign in to see your tasks.</div>
          )}
        </CardContent>
      </Card>

      {showAIInsights && aiInsights && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Pipeline Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{aiInsights.executive_summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pipeline Health</span>
                <Badge className={getHealthBadge(aiInsights.pipeline_health.overall_status)}>
                  {aiInsights.pipeline_health.overall_status.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.pipeline_health.strengths && aiInsights.pipeline_health.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-green-700">Strengths</h4>
                  <ul className="space-y-1">
                    {aiInsights.pipeline_health.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiInsights.pipeline_health.bottlenecks && aiInsights.pipeline_health.bottlenecks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-700">Bottlenecks</h4>
                  <ul className="space-y-1">
                    {aiInsights.pipeline_health.bottlenecks.map((bottleneck, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{bottleneck}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Gaps & Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.skill_gaps.critical_gaps && aiInsights.skill_gaps.critical_gaps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-700">Critical Skill Gaps</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.skill_gaps.critical_gaps.map((skill, idx) => (
                      <Badge key={idx} className="bg-red-100 text-red-800">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {aiInsights.hiring_forecast && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{aiInsights.hiring_forecast.predicted_hires_quarter}</div>
                    <div className="text-xs text-slate-600">Predicted Hires (Next Quarter)</div>
                  </div>
                  {aiInsights.hiring_forecast.hardest_to_fill_roles && aiInsights.hiring_forecast.hardest_to_fill_roles.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Hardest to Fill:</p>
                      <div className="flex flex-wrap gap-1">
                        {aiInsights.hiring_forecast.hardest_to_fill_roles.map((role, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{role}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {aiInsights.action_items && aiInsights.action_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights.action_items.map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{item.action}</h4>
                        <Badge className={getPriorityBadge(item.priority)}>
                          {item.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        <strong>Expected Impact:</strong> {item.expected_impact}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {widgets && widgets.length > 0 ? (
        <div className="space-y-4">
          {isAdmin ? (
            <DragDropContext onDragEnd={onWidgetDragEnd}>
              <Droppable droppableId="dash-widgets" direction="horizontal">
                {(drop) => (
                  <div ref={drop.innerRef} {...drop.droppableProps} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {widgets.map((w, idx) => (
                      <Draggable key={w.id} draggableId={w.id} index={idx}>
                        {(drag) => (
                          <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} className="w-full">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {widgets.map(w => <WidgetRenderer key={w.id} widget={w} refreshKey={refreshKey} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-base text-indigo-900">Candidates by Status</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {statusData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-base text-purple-900">Jobs by Status</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Jobs" fill={COLORS[1]} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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
