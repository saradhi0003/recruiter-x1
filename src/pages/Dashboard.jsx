import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Briefcase, Building2, TrendingUp,
  Plus, RefreshCcw, Sparkles, AlertTriangle,
  CheckCircle2, Loader2, ChevronRight, Target,
  Activity, Zap, BarChart2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Candidate, Job, Company, Application, Submission, Task } from "@/entities/all";
import { User as UserEntity } from "@/entities/all";
import { usePermissions } from "@/components/common/PermissionsContext";
import { getRolesCached } from "@/components/utils/rolesCache";
import { InvokeLLM } from "@/integrations/Core";
import { addNotification } from "@/components/notifications/NotificationToast";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import DataListModal from "@/components/common/DataListModal";
import WidgetRenderer from "@/components/dashboard/WidgetRenderer";
import BuilderModal from "@/components/dashboard/BuilderModal";
import { DashboardConfig } from "@/entities/DashboardConfig";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import CandidateWorkflowAgent from "../components/ai/CandidateWorkflowAgent";
import { motion, AnimatePresence } from "framer-motion";

const EMBER = "#E8A020";
const TEAL = "#3ECFB2";
const COLORS = [EMBER, TEAL, "#7C6EFA", "#E86B50", "#4DA6FF", "#82ca9d"];

// ── Animated counter
function CountUp({ target, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <span>{display.toLocaleString()}</span>;
}

// ── KPI Card
function StatCard({ title, value, icon: Icon, accent, delay = 0, onClick, subtitle }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="ember-card relative rounded-xl p-6 cursor-pointer overflow-hidden group"
      style={{
        transform: hovered ? 'translateY(-3px) rotateX(1deg)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Accent glow in corner */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: accent || EMBER, opacity: hovered ? 0.12 : 0.06, transition: 'opacity 0.4s' }}
      />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${accent || EMBER}20`, border: `1px solid ${accent || EMBER}30` }}
          >
            <Icon className="w-5 h-5" style={{ color: accent || EMBER }} />
          </div>
          <ChevronRight
            className="w-4 h-4 transition-transform duration-200"
            style={{ color: 'var(--text-muted)', transform: hovered ? 'translateX(3px)' : 'none' }}
          />
        </div>

        <p className="text-xs uppercase tracking-[0.15em] mb-2 font-ui" style={{ color: 'var(--text-muted)' }}>
          {title}
        </p>
        <div className="stat-number">
          <CountUp target={value} />
        </div>
        {subtitle && (
          <p className="text-xs mt-2 font-ui" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-[2px] transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, ${accent || EMBER}, transparent)`,
          width: hovered ? '100%' : '0%',
        }}
      />
    </motion.div>
  );
}

// ── Section header
function SectionLabel({ children, accent }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-5 rounded-full" style={{ background: accent || EMBER }} />
      <h2 className="text-xs uppercase tracking-[0.2em] font-ui font-medium" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </h2>
    </div>
  );
}

// ── Task row
function TaskRow({ task, onComplete, index }) {
  const overdue = task.due_date && (new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0));
  const priorityColor = { high: '#E86B50', medium: EMBER, low: TEAL }[task.priority] || EMBER;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="flex items-center gap-3 p-3 rounded-lg group transition-colors duration-200"
      style={{ background: 'var(--carbon-surface-3)' }}
    >
      <button
        onClick={() => onComplete(task.id)}
        className="w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ borderColor: priorityColor, background: 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = `${priorityColor}20`}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-ui truncate" style={{ color: overdue ? '#E86B50' : 'var(--text-primary)' }}>
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {task.due_date && (
            <span className="text-xs font-mono-dm" style={{ color: overdue ? '#E86B50' : 'var(--text-muted)' }}>
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <span
            className="text-xs uppercase tracking-wider font-ui"
            style={{ color: priorityColor, opacity: 0.8 }}
          >
            {task.priority}
          </span>
        </div>
      </div>
      {overdue && (
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#E86B50' }} />
      )}
    </motion.div>
  );
}

// ── Custom tooltip for charts
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs font-ui"
      style={{ background: 'var(--carbon-surface-3)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
      <p style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

// ── AI Insights Panel
function AIInsightsPanel({ insights, onClose }) {
  if (!insights) return null;
  const healthColor = { healthy: TEAL, at_risk: EMBER, critical: '#E86B50' }[insights.pipeline_health?.overall_status] || EMBER;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-xl p-6 space-y-6"
      style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-2xl italic" style={{ color: 'var(--text-primary)' }}>
            AI Pipeline Intelligence
          </h3>
          <p className="text-sm mt-1 font-ui" style={{ color: 'var(--text-secondary)' }}>
            {insights.executive_summary}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-ui font-medium"
          style={{ background: `${healthColor}20`, color: healthColor, border: `1px solid ${healthColor}40` }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: healthColor }} />
          {insights.pipeline_health?.overall_status?.replace(/_/g, ' ').toUpperCase()}
        </div>
      </div>

      <div className="ember-divider" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-4" style={{ background: 'var(--carbon-surface-3)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-xs uppercase tracking-wider mb-3 font-ui" style={{ color: 'var(--text-muted)' }}>Critical Skill Gaps</p>
          <div className="flex flex-wrap gap-1.5">
            {insights.skill_gaps?.critical_gaps?.slice(0, 5).map((skill, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded font-mono-dm"
                style={{ background: 'rgba(232,160,32,0.1)', color: EMBER, border: '1px solid rgba(232,160,32,0.2)' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ background: 'var(--carbon-surface-3)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-xs uppercase tracking-wider mb-2 font-ui" style={{ color: 'var(--text-muted)' }}>Forecast</p>
          <div className="font-display text-4xl" style={{ color: TEAL }}>
            {insights.hiring_forecast?.predicted_hires_quarter}
          </div>
          <p className="text-xs mt-1 font-ui" style={{ color: 'var(--text-muted)' }}>hires next quarter</p>
        </div>

        <div className="rounded-lg p-4" style={{ background: 'var(--carbon-surface-3)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-xs uppercase tracking-wider mb-3 font-ui" style={{ color: 'var(--text-muted)' }}>Bottlenecks</p>
          <ul className="space-y-1.5">
            {insights.pipeline_health?.bottlenecks?.slice(0, 3).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-ui" style={{ color: 'var(--text-secondary)' }}>
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#E86B50' }} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {insights.action_items?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider mb-3 font-ui" style={{ color: 'var(--text-muted)' }}>Priority Actions</p>
          <div className="space-y-2">
            {insights.action_items.slice(0, 4).map((item, i) => {
              const pc = { high: '#E86B50', medium: EMBER, low: TEAL }[item.priority] || EMBER;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--carbon-surface-3)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: pc }} />
                  <div>
                    <p className="text-sm font-ui" style={{ color: 'var(--text-primary)' }}>{item.action}</p>
                    <p className="text-xs mt-0.5 font-ui" style={{ color: 'var(--text-muted)' }}>{item.expected_impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button onClick={onClose} className="text-xs font-ui transition-colors duration-200"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        Dismiss insights
      </button>
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalCandidates: 0, activeJobs: 0, totalCompanies: 0, thisMonthPlacements: 0 });
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
      if (!admin && meUser?.email) taskFilter = { created_by: meUser.email };

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

      const activeJobs = jobsData.filter(j => j.status === 'open').length;
      const thisMonth = new Date();
      const thisMonthPlacements = applicationsData.filter(a => {
        const d = new Date(a.created_date);
        return a.status === 'hired' && d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
      }).length;

      setStats({ totalCandidates: candidatesData.length, activeJobs, totalCompanies: companiesData.length, thisMonthPlacements });

      const today = new Date(); today.setHours(0,0,0,0);
      const my = tasks
        .filter(t => ["pending","in_progress"].includes(t.status))
        .filter(t => { if (!t.due_date) return true; const d = new Date(t.due_date); d.setHours(0,0,0,0); return d <= today; })
        .sort((a,b) => { const da = a.due_date ? new Date(a.due_date) : new Date("9999-12-31"); const db = b.due_date ? new Date(b.due_date) : new Date("9999-12-31"); return da - db; });
      setMyTasksToday(my);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    setLoading(false);
    dashGuard.current.inFlight = false;
    dashGuard.current.ts = Date.now();
  }, [listFilterFor]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

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
    if (isAdmin && config?.id) await DashboardConfig.update(config.id, { ...config, widgets: arr });
  };

  const completeTask = async (taskId) => {
    try {
      await Task.update(taskId, { status: "completed", completion_notes: "Completed from Dashboard" });
      loadDashboardData(true);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const openModalFor = (type) => {
    const fmt = (d) => d ? new Date(d).toLocaleDateString() : "—";
    if (type === "candidates") {
      setModal({ open: true, title: "All Candidates", columns: [
        { key: "name", label: "Name" }, { key: "email", label: "Email" },
        { key: "status", label: "Status" }, { key: "location", label: "Location" }
      ], rows: candidates.map(c => ({ name: `${c.first_name} ${c.last_name}`, email: c.email, status: c.status?.replace("_"," "), location: c.location || "—" })) });
    } else if (type === "jobs") {
      setModal({ open: true, title: "All Jobs", columns: [
        { key: "title", label: "Title" }, { key: "company", label: "Company" },
        { key: "status", label: "Status" }, { key: "priority", label: "Priority" }, { key: "due", label: "Due" }
      ], rows: jobs.map(j => { const c = companies.find(co => co.id === j.company_id); return { title: j.title, company: c?.name || "—", status: j.status?.replace("_"," "), priority: j.priority, due: fmt(j.due_date) }; }) });
    } else if (type === "companies") {
      setModal({ open: true, title: "All Companies", columns: [
        { key: "name", label: "Company" }, { key: "industry", label: "Industry" },
        { key: "status", label: "Status" }, { key: "open_jobs", label: "Open Jobs" }
      ], rows: companies.map(co => ({ name: co.name, industry: co.industry || "—", status: co.status || "—", open_jobs: jobs.filter(j => j.company_id === co.id && j.status === "open").length })) });
    } else if (type === "hires") {
      setModal({ open: true, title: "Recent Hires", columns: [
        { key: "candidate", label: "Candidate" }, { key: "job", label: "Job" }, { key: "hired_on", label: "Hired On" }
      ], rows: applications.filter(a => a.status === "hired").map(a => { const c = candidates.find(ca => ca.id === a.candidate_id); const j = jobs.find(jo => jo.id === a.job_id); return { candidate: c ? `${c.first_name} ${c.last_name}` : "—", job: j?.title || "—", hired_on: fmt(a.created_date) }; }) });
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzingAI(true);
    try {
      const skillsCount = {};
      candidates.forEach(c => (c.skills || []).forEach(s => { skillsCount[s] = (skillsCount[s] || 0) + 1; }));
      const jobSkillsCount = {};
      jobs.forEach(j => (j.required_skills || []).forEach(s => { jobSkillsCount[s] = (jobSkillsCount[s] || 0) + 1; }));

      const response = await InvokeLLM({
        prompt: `Analyze this recruitment data and provide strategic insights:
Candidates: ${candidates.length}, by status: ${JSON.stringify(candidates.reduce((a,c) => { a[c.status]=(a[c.status]||0)+1; return a; }, {}))}
Jobs: ${jobs.length}, open: ${jobs.filter(j=>j.status==='open').length}
Applications: ${applications.length}, by status: ${JSON.stringify(applications.reduce((a,ap) => { a[ap.status]=(a[ap.status]||0)+1; return a; }, {}))}
Top candidate skills: ${Object.entries(skillsCount).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k])=>k).join(', ')}
Top required job skills: ${Object.entries(jobSkillsCount).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k])=>k).join(', ')}
Provide skill_gaps, hiring_forecast, pipeline_health, action_items, and executive_summary.`,
        response_json_schema: {
          type: "object",
          properties: {
            skill_gaps: { type: "object", properties: { critical_gaps: { type: "array", items: { type: "string" } }, recommendations: { type: "string" } } },
            hiring_forecast: { type: "object", properties: { predicted_hires_next_month: { type: "number" }, predicted_hires_quarter: { type: "number" }, hardest_to_fill_roles: { type: "array", items: { type: "string" } }, recommendations: { type: "string" } } },
            pipeline_health: { type: "object", properties: { overall_status: { type: "string", enum: ["healthy","at_risk","critical"] }, bottlenecks: { type: "array", items: { type: "string" } }, strengths: { type: "array", items: { type: "string" } }, recommendations: { type: "string" } } },
            action_items: { type: "array", items: { type: "object", properties: { priority: { type: "string", enum: ["high","medium","low"] }, action: { type: "string" }, expected_impact: { type: "string" } } } },
            executive_summary: { type: "string" }
          },
          required: ["skill_gaps","hiring_forecast","pipeline_health","action_items","executive_summary"]
        }
      });
      setAIInsights(response);
      setShowAIInsights(true);
      addNotification({ type: "success", title: "Analysis Complete", message: "AI insights generated" });
    } catch (error) {
      console.error("AI analysis error:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to generate insights" });
    }
    setAnalyzingAI(false);
  };

  // Chart data
  const candidatesByStatus = candidates.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
  const jobsByStatus = jobs.reduce((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc; }, {});
  const statusData = Object.entries(candidatesByStatus).map(([name, value]) => ({ name: name.replace(/_/g," "), value }));
  const jobStatusData = Object.entries(jobsByStatus).map(([name, value]) => ({ name: name.replace(/_/g," "), value }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--carbon-base)' }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: `${EMBER} transparent transparent transparent` }} />
          </div>
          <p className="font-display text-xl italic" style={{ color: 'var(--text-secondary)' }}>
            Loading intelligence...
          </p>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-ui p-5 lg:p-8 space-y-8"
      style={{ background: 'var(--carbon-base)', color: 'var(--text-primary)' }}
    >
      {/* ── Background atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Ember bloom top-right */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: EMBER, opacity: 0.06, animation: 'ember-breathe 8s ease-in-out infinite' }}
        />
        {/* Teal accent bottom-left */}
        <div
          className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: TEAL, opacity: 0.04 }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ fontSize: '18vw', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700,
            color: 'rgba(255,255,255,0.012)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          RECRUITER X
        </div>
      </div>

      <div className="relative z-10">
        {/* ── Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start justify-between mb-10"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.25em] mb-2 font-ui" style={{ color: 'var(--text-muted)' }}>
              {greeting()}, {me?.full_name?.split(' ')[0] || 'Recruiter'}
            </p>
            <h1 className="font-display text-5xl lg:text-6xl font-light italic" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Intelligence<br /><span style={{ color: EMBER }}>Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={runAIAnalysis}
              disabled={analyzingAI}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-ui font-medium transition-all duration-200"
              style={{
                background: `${EMBER}15`,
                border: `1px solid ${EMBER}40`,
                color: EMBER,
                opacity: analyzingAI ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!analyzingAI) { e.currentTarget.style.background = `${EMBER}25`; e.currentTarget.style.borderColor = `${EMBER}80`; }}}
              onMouseLeave={e => { e.currentTarget.style.background = `${EMBER}15`; e.currentTarget.style.borderColor = `${EMBER}40`; }}
            >
              {analyzingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {analyzingAI ? 'Analyzing…' : 'AI Insights'}
            </button>
            <button
              onClick={() => { setRefreshKey(k => k + 1); loadDashboardData(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-ui transition-all duration-200"
              style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-highlight)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            {isAdmin && (
              <button
                onClick={() => setBuilderOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-ui transition-all duration-200"
                style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-highlight)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Plus className="w-4 h-4" />
                Customize
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Divider */}
        <div className="ember-divider mb-10" />

        {/* ── KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard title="Total Candidates" value={stats.totalCandidates} icon={Users} accent={TEAL} delay={0.05}
            subtitle="in pipeline" onClick={() => openModalFor("candidates")} />
          <StatCard title="Active Jobs" value={stats.activeJobs} icon={Briefcase} accent={EMBER} delay={0.12}
            subtitle="open positions" onClick={() => openModalFor("jobs")} />
          <StatCard title="Client Companies" value={stats.totalCompanies} icon={Building2} accent="#7C6EFA" delay={0.19}
            subtitle="connections" onClick={() => openModalFor("companies")} />
          <StatCard title="Placements This Month" value={stats.thisMonthPlacements} icon={TrendingUp} accent="#E86B50" delay={0.26}
            subtitle="successful hires" onClick={() => openModalFor("hires")} />
        </div>

        {/* ── AI Workflow Agent */}
        <div className="mb-8">
          <CandidateWorkflowAgent />
        </div>

        {/* ── AI Insights */}
        <AnimatePresence>
          {showAIInsights && aiInsights && (
            <div className="mb-8">
              <AIInsightsPanel insights={aiInsights} onClose={() => setShowAIInsights(false)} />
            </div>
          )}
        </AnimatePresence>

        {/* ── Two-column: Tasks + Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="lg:col-span-2 rounded-xl p-6"
            style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)' }}
          >
            <SectionLabel>Today's Tasks</SectionLabel>
            <div className="space-y-2">
              {me ? (
                myTasksToday.length ? (
                  myTasksToday.slice(0, 8).map((t, i) => (
                    <TaskRow key={t.id} task={t} onComplete={completeTask} index={i} />
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3" style={{ color: TEAL, opacity: 0.6 }} />
                    <p className="text-sm font-ui" style={{ color: 'var(--text-muted)' }}>All clear — no tasks due today</p>
                  </div>
                )
              ) : (
                <p className="text-sm font-ui" style={{ color: 'var(--text-muted)' }}>Sign in to see your tasks.</p>
              )}
            </div>
            {myTasksToday.length > 0 && (
              <Link to={createPageUrl("Tasks")} className="flex items-center gap-1 mt-4 text-xs font-ui transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = EMBER}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                View all tasks <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </motion.div>

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="lg:col-span-3 space-y-4"
          >
            <div className="rounded-xl p-6" style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)' }}>
              <SectionLabel accent={TEAL}>Candidate Pipeline</SectionLabel>
              <div className="h-44">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} barCategoryGap="30%">
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-ui)' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="value" name="Candidates" radius={[4, 4, 0, 0]}>
                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm font-ui" style={{ color: 'var(--text-muted)' }}>No candidate data yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl p-6" style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)' }}>
              <SectionLabel accent="#7C6EFA">Jobs by Status</SectionLabel>
              <div className="h-40">
                {jobStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={jobStatusData} dataKey="value" nameKey="name" outerRadius={60} innerRadius={30} paddingAngle={3}>
                        {jobStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />)}
                      </Pie>
                      <Tooltip content={<DarkTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm font-ui" style={{ color: 'var(--text-muted)' }}>No job data yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Custom widgets */}
        {widgets && widgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <SectionLabel>Custom Widgets</SectionLabel>
            {isAdmin ? (
              <DragDropContext onDragEnd={onWidgetDragEnd}>
                <Droppable droppableId="dash-widgets" direction="horizontal">
                  {(drop) => (
                    <div ref={drop.innerRef} {...drop.droppableProps} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {widgets.map((w, idx) => (
                        <Draggable key={w.id} draggableId={w.id} index={idx}>
                          {(drag) => (
                            <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}
                              className="rounded-xl overflow-hidden"
                              style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)' }}>
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
                {widgets.map(w => (
                  <div key={w.id} className="rounded-xl overflow-hidden"
                    style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)' }}>
                    <WidgetRenderer widget={w} refreshKey={refreshKey} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Quick nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <div className="ember-divider mb-6" />
          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: 'Candidates', to: 'Candidates', icon: Users },
              { label: 'Jobs', to: 'Jobs', icon: Briefcase },
              { label: 'Submissions', to: 'Submissions', icon: Activity },
              { label: 'Goals', to: 'Goals', icon: Target },
              { label: 'Playbooks', to: 'Playbooks', icon: BarChart2 },
            ].map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={createPageUrl(to)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-ui uppercase tracking-wider transition-all duration-200"
                style={{ background: 'var(--carbon-surface-2)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-highlight)'; e.currentTarget.style.color = EMBER; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Modals */}
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