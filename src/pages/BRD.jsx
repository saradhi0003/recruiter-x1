
import React, { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Entities (used to render live JSON Schemas below)
import { Candidate } from "@/entities/Candidate";
import { Company } from "@/entities/Company";
import { Job } from "@/entities/Job";
import { Application } from "@/entities/Application";
import { Submission } from "@/entities/Submission";
import { Task } from "@/entities/Task";
import { CandidateView } from "@/entities/CandidateView";
import { SubmissionView } from "@/entities/SubmissionView";
import { TaskView } from "@/entities/TaskView";
import { DashboardConfig } from "@/entities/DashboardConfig";
import { EmailTemplate } from "@/entities/EmailTemplate";
import { AppSettings } from "@/entities/AppSettings";
// Removed EmailIntegrationSettings and InboundEmail
import { JobStack } from "@/entities/JobStack";
import { Role } from "@/entities/Role";
import { Resume } from "@/entities/Resume";
import { Invoice } from "@/entities/Invoice";
import { Expense } from "@/entities/Expense";
import { AuditLog } from "@/entities/AuditLog";
import { User as UserEntity } from "@/entities/User";
import { InboundEmail } from "@/entities/InboundEmail"; // Added InboundEmail import

// Helper: fetch and show live JSON schema for an entity
function SchemaViewer({ title, entity }) {
  const [schema, setSchema] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await entity.schema();
        if (mounted) setSchema(s);
      } catch {
        setSchema({ error: "Schema unavailable" });
      }
    })();
    return () => { mounted = false; };
  }, [entity]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-80">{schema ? JSON.stringify(schema, null, 2) : "Loading schema..."}</pre>
      </CardContent>
    </Card>
  );
}

export default function BRD() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="BRD — Recruiter X"
        subtitle="Structured Business Requirements Document with scope, data model, and AI details"
      />

      {/* Table of Contents */}
      <Card id="toc">
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-700 text-sm">
          <ol className="list-decimal pl-5 space-y-1">
            <li><a className="text-blue-600 hover:underline" href="#overview">Project Overview & Goals</a></li>
            <li><a className="text-blue-600 hover:underline" href="#users-roles">Users & Roles</a></li>
            <li><a className="text-blue-600 hover:underline" href="#functional">Functional Requirements</a></li>
            <li><a className="text-blue-600 hover:underline" href="#nonfunctional">Non‑Functional Requirements</a></li>
            <li><a className="text-blue-600 hover:underline" href="#data-model">Data Model Overview</a></li>
            <li><a className="text-blue-600 hover:underline" href="#permissions">Role/Permissions Matrix</a></li>
            <li><a className="text-blue-600 hover=" href="#integrations">Integrations</a></li>
            <li><a className="text-blue-600 hover:underline" href="#acceptance">Acceptance Criteria</a></li>
            <li><a className="text-blue-600 hover:underline" href="#future">Future Enhancements</a></li>
            <li><a className="text-blue-600 hover:underline" href="#glossary">Glossary</a></li>
            <li><a className="text-blue-600 hover:underline" href="#branding">UI/Branding Update Overview</a></li>
            <li><a className="text-blue-600 hover:underline" href="#recent-updates">Recent Updates & New Features</a></li>
            <li><a className="text-blue-600 hover:underline" href="#ai-quick-actions">AI Quick Actions - Detailed Specification</a></li>
            <li><a className="text-blue-600 hover:underline" href="#paste-to-add">Paste to Add Candidate - Detailed Specification</a></li>
          </ol>
        </CardContent>
      </Card>

      {/* Project Overview & Goals */}
      <Card id="overview">
        <CardHeader>
          <CardTitle>Project Overview & Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>End‑to‑end recruitment workspace covering Candidates, Jobs, Companies (Connections), Submissions/Applications, Tasks, Invoices/Expenses, and Resumes.</li>
            <li>Saved list views with visibility controls (Private, Team, Public, Role‑based) to avoid duplicates.</li>
            <li>Bulk Bench Scoring on “Our Bench” or any saved view; score persisted to Candidate.</li>
            <li>Global Preview Center with context, quick navigation, and explicit Edit navigation.</li>
            <li>LLM‑powered Ask AI with page‑aware context and action mode.</li>
            <li>Role‑based access control and audit logging; customizable global dashboard widgets.</li>
          </ul>
          <div className="text-xs">
            Shortcuts: <Link className="text-blue-600 hover:underline" to={createPageUrl("Candidates")}>Candidates</Link> •{" "}
            <Link className="text-blue-600 hover:underline" to={createPageUrl("Jobs")}>Jobs</Link> •{" "}
            <Link className="text-blue-600 hover:underline" to={createPageUrl("Dashboard")}>Dashboard</Link>
          </div>
        </CardContent>
      </Card>

      {/* Users & Roles */}
      <Card id="users-roles">
        <CardHeader>
          <CardTitle>Users & Roles</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-slate-700">
          <div>
            <h4 className="font-semibold">Admin</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Full access to all entities; can manage Roles, DashboardConfig, and system settings.</li>
              <li>Can create global dashboards and shared views.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Recruiter</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>View most records; create/update own; limited deletes by scope.</li>
              <li>Can edit Candidates and update status; bulk scoring and views available per visibility.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Functional Requirements */}
      <div id="functional" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Candidate List Views</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Create views with filters, columns, sort; set default view.</li>
              <li>Visibility: <Badge variant="secondary">Private</Badge> <Badge variant="secondary">Team</Badge> <Badge variant="secondary">Public</Badge> <Badge variant="secondary">Role‑based</Badge>.</li>
              <li>Edit/Delete views (owner and admins only). RLS enforces visibility.</li>
              <li>Usable across pages and inside Bulk Scoring modal.</li>
            </ul>
          </CardContent>
        </Card>
        {/* 3.1 Dashboard */}
        <Card>
          <CardHeader><CardTitle>3.1 Dashboard</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>KPIs and charts for pipeline at‑a‑glance; Quick Actions to add key records.</li>
              <li>"My Tasks Today" card with inline complete (due/overdue prioritized).</li>
              <li>Custom Global Dashboard (Admin): Builder composes a global layout (read‑only for non‑admins).</li>
              <li>Widget types: KPI (count), Bar, Pie (group‑by), Line (time series by month), Stacked.</li>
              <li>Data sources: Candidate, Job, Company (Connections), Application, Submission, Task.</li>
              <li>Widget options: Title, Entity, Type, Group By, Date field (for line/stacked), Filter JSON (exact matches), Width (1–2 columns).</li>
              <li>Drag‑and‑drop reorder with auto‑save → DashboardConfig (is_global=true, is_active=true).</li>
              <li>Responsive grid; Refresh reloads latest numbers without full page reload.</li>
              <li><strong>NEW: AI Pipeline Insights</strong> - On-demand comprehensive analysis with "AI Insights" button.</li>
              <li><strong>Skill Gap Analysis:</strong> Identifies critical skill shortages and sourcing priorities.</li>
              <li><strong>Hiring Forecast:</strong> Predicts hiring needs for next quarter, identifies hardest-to-fill roles.</li>
              <li><strong>Pipeline Health:</strong> Overall status (healthy/at_risk/critical), bottlenecks, strengths, recommendations.</li>
              <li><strong>Action Items:</strong> Prioritized immediate actions with expected impact analysis.</li>
              <li><strong>Consolidated View:</strong> Merged pipeline analytics into dashboard (removed duplicate page).</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bulk Bench Scoring</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Select cohort via Candidate View (default: status=our_bench).</li>
              <li>Select any Job with status Draft or Open.</li>
              <li>Skip candidates without resume; result marked as Skipped.</li>
              <li>Persist bench_match_score (0–100) and bench_score_details (JSON) to Candidate.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Preview Center & Editing</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Right‑side global preview for Candidate, Job, Company, Application, Task, Playbook.</li>
              <li>Explicit “Edit” actions bypass preview and navigate to full edit page.</li>
              <li>Inline status update for Candidate within preview.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.2 Candidates */}
        <Card>
          <CardHeader><CardTitle>3.2 Candidates</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Search, filter, add/edit from modal (resume upload + AI parsing).</li>
              <li>Candidate Details: Overview, Applications (with AI score), Documents, Activity.</li>
              <li>Related panel: Applications, Submissions, Tasks, Resumes (recent items).</li>
              <li>AI Candidate Summary panel with regenerate and Q&A.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.3 Jobs */}
        <Card>
          <CardHeader><CardTitle>3.3 Jobs</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>List, search, filter; view details and associated applications.</li>
              <li>Track status, priority, location, compensation, due date.</li>
              <li>Email Blast: select one/all jobs, auto‑summarize with AI, send to marketing recruiters and optionally selected candidates; choose Email Template; respects Email Settings gating.</li>
              <li><strong>NEW: AI Candidate Matching</strong> - Recommended Candidates section on Job Details page.</li>
              <li><strong>Top 5 Ranked Candidates:</strong> AI scores all active candidates (0-100 fit score).</li>
              <li><strong>Detailed Breakdown:</strong> Matching skills (green), missing skills (red), strengths, concerns.</li>
              <li><strong>Visual Ranking:</strong> #1-#5 badges with color-coded scores (Excellent/Good/Potential/Weak Match).</li>
              <li><strong>AI Scoring Criteria:</strong> Skills match (required & preferred), experience alignment, location compatibility, work authorization fit, title/role relevance.</li>
              <li><strong>Auto-Analysis:</strong> Runs automatically on Job Details page load; manual refresh available.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.4 Submissions */}
        <Card>
          <CardHeader><CardTitle>3.4 Submissions</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Create submission, status tracking, client feedback.</li>
              <li>Follow‑up reminders with due indicators and quick actions.</li>
              <li>Auto‑create next‑day follow‑up Task on submission create; status changes auto‑sync related Task status/due date.</li>
              <li>Details modal with related candidate/job, related tasks, AI summary, and email actions.</li>
              <li>Board/List views with saved views; drag‑and‑drop updates status.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.5 Resume Studio (Unified Build + Score) */}
        <Card>
          <CardHeader><CardTitle>3.5 Resume Studio (Build + Score)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Build tab: inline editor (left), live preview (right), zoom, autoscale, save, print.</li>
              <li>Score tab: paste/upload JD and Resume text; compare text only; JD vs Resume Comparison alongside Live Score.</li>
              <li>AI Resume Builder panel: generate tailored JSON resume and apply to editor.</li>
              <li>Scoring model weights: Hard Skills (highest), Education, Job Title, Soft Skills, Other Keywords; target 75–80%.</li>
              <li>Frequency maps for skills; add missing skills inline.</li>
              <li>Excluded from Score tab: bulk ranking and version snapshots (kept for focus).</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.6 AI Assistant (Global) */}
        <Card>
          <CardHeader><CardTitle>3.6 AI Assistant (Global)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Floating launcher opens side‑panel chat on every page.</li>
              <li>Loads scoped context (Candidates, Jobs, Applications, etc.) with counters and samples.</li>
              <li>Quick prompts for pipeline, overdue tasks, and top matches.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.7 Access Control */}
        <Card>
          <CardHeader><CardTitle>3.7 Access Control</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Users list with search and role assignment.</li>
              <li>Roles & Permissions matrix: toggle View/Create/Edit/Delete per entity; scope All/Own.</li>
              <li>UI enforcement via PermissionGate; “own” uses created_by; server‑side RLS mirrors rules.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.8 Connections, Consultants, Tasks, Playbooks */}
        <Card>
          <CardHeader><CardTitle>3.8 Connections, Consultants, Tasks, Playbooks</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Connections (Companies): lists with search/filters; details modal (Overview, Contacts, Related), ESC to close.</li>
              <li>Connections Email Blast: multi‑select companies; recipients compiled from contacts (deduped); AI‑generated draft with edit; Send via SendEmail respecting Email Settings; ESC to close.</li>
              <li>Consultants, Tasks, Playbooks: lists with search; create/edit per permissions; Playbooks include rich details and document links.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.9 Email Settings & Sending */}
        <Card>
          <CardHeader><CardTitle>3.9 Email Settings & Sending</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Email sending gated by Email Settings: provider Gmail/Outlook and connected.</li>
              <li>All email features disabled until connected; From uses current user where supported.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3.10 Accounts */}
        <Card>
          <CardHeader><CardTitle>3.10 Accounts (Invoices & Expenses)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Invoices: create/edit items, tax, totals; email to contacts; statuses (draft, sent, paid, overdue, void).</li>
              <li>Invoices summary shows Pending and Received totals.</li>
              <li>Expenses: track categories, date, amount, location, vendor, notes; CSV import planned via backend functions.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>3.11 My Work (Enhanced)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>NEW: Tab-Based Navigation</strong> - Overview, Quick Entry, Weekly Submit, Leave Requests.</li>
              <li><strong>Quick Stats Cards:</strong> Hours this week, approved hours (month), pending leave, draft entries.</li>
              <li><strong>Quick Time Entry:</strong> Single-form entry for date, hours, job, notes; saves as draft.</li>
              <li><strong>Draft Management:</strong> Real-time tracking of draft timesheets before submission.</li>
              <li><strong>Leave Validation:</strong> Automatically blocks time entry on leave dates.</li>
              <li><strong>Overview Tab:</strong> Recent timesheets (last 5) and leave requests preview with quick-add buttons.</li>
              <li><strong>Weekly Submit Tab:</strong> Range-based timesheet submission with calendar picker.</li>
              <li><strong>Leave Tab:</strong> Apply for leave and view request history (last 12 months).</li>
              <li><strong>Auto-Notifications:</strong> Admins notified on submissions; users notified on approval/rejection.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>3.12 Approvals (Enhanced with AI)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Quick Stats Dashboard:</strong> Pending leaves, pending timesheets, pending hours, users waiting.</li>
              <li><strong>Batch Operations:</strong> "Approve All" for leaves and timesheets; individual actions (approve/reject/revision).</li>
              <li><strong>Weekly Grouping:</strong> Timesheets grouped by user + week for efficient approval.</li>
              <li><strong>NEW: AI Insights Button</strong> - Comprehensive approval analytics on-demand.</li>
              <li><strong>Workload Analysis:</strong> Overall assessment (healthy/overworked/underutilized/concerning) with concerns and recommendations.</li>
              <li><strong>Productivity Score:</strong> 0-100 score with strengths and areas for improvement.</li>
              <li><strong>Leave Patterns:</strong> Trend analysis, unusual pattern detection, staffing concerns, policy recommendations.</li>
              <li><strong>Approval Efficiency:</strong> Efficiency score (0-100), red flags identification, process improvements, bottleneck detection.</li>
              <li><strong>Action Items:</strong> Prioritized recommendations (high/medium/low) with expected impact.</li>
              <li><strong>Pattern Recognition:</strong> Identifies busiest days, most common work hours, flags anomalies.</li>
              <li><strong>Email Notifications:</strong> Auto-sends emails to users on all approval decisions.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>3.13 Interview Assistant (Enhanced)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>NEW: Question Library</strong> - Pre-built questions across 5 categories (technical, behavioral, situational, culture_fit, experience).</li>
              <li><strong>One-Click Category Addition:</strong> Add entire question sets (5+ questions per category) instantly.</li>
              <li><strong>Per-Question Rating:</strong> 1-5 scale slider for each question with real-time scoring.</li>
              <li><strong>NEW: Live Score Calculator</strong> - Auto-calculates as you rate:</li>
              <li>  • Overall score (0-100 scale)</li>
              <li>  • Average rating (1-5 scale)</li>
              <li>  • Completion percentage</li>
              <li>  • Category breakdown (e.g., Technical: 4.2/5, Behavioral: 3.8/5)</li>
              <li><strong>AI Summary Integration:</strong> Uses calculated scores in final analysis and recommendations.</li>
              <li><strong>Custom Questions:</strong> Add custom questions anytime with same rating system.</li>
              <li><strong>Interview Types:</strong> Phone screen, technical, behavioral, culture fit, panel, final round.</li>
              <li><strong>Good Answer Indicators:</strong> AI-suggested indicators for each question to guide evaluation.</li>
              <li><strong>Session Management:</strong> Save sessions with candidate, job, date, interviewer, status.</li>
              <li><strong>AI Analysis:</strong> Generates comprehensive summary with strengths, concerns, technical assessment, cultural fit, hiring recommendation, next steps.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Email ingest functionality has been removed. */}

        <Card>
          <CardHeader><CardTitle>Ask AI (Global Assistant)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Page‑aware context and quick prompts.</li>
              <li>Action Mode translates commands to Entity SDK calls with permission checks.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Profile Resolver & Matching Engine */}
      <Card id="resolver">
        <CardHeader>
          <CardTitle>BRD: Profile Resolver & Matching Engine — Version 1.0</CardTitle>
          <div className="text-xs text-slate-500">Date: October 26, 2023</div>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700">
          <div>
            <h4 className="font-semibold">Executive Summary</h4>
            <p className="text-sm">A centralized, AI‑powered search and aggregation feature that resolves fragmented data into a unified “Master Profile”, consolidating Candidates, Recruiters, and Companies with their relationships for a 360° view.</p>
          </div>
          <div>
            <h4 className="font-semibold">Business Problem & Opportunity</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Data is fragmented across entities; manual cross‑referencing is slow and error‑prone.</li>
              <li>An intelligent resolver provides instant, actionable insights and a single source of truth.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Goals & Objectives</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Reduce time to assemble a complete profile by 70%+.</li>
              <li>Provide unified search with aggregation and relationship mapping.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Scope</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">In‑Scope</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Unified search; parse Name/Email/Company/LinkedIn.</li>
                  <li>Parallel internal searches; aggregation into Master Profiles.</li>
                  <li>Relationship visualization (e.g., applications, jobs, contacts).</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Out‑of‑Scope</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Real‑time external scraping; direct editing of external sources.</li>
                  <li>User workflow automation (handled elsewhere).</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Functional Requirements</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>FR‑001: Unified search bar in main layout.</li>
              <li>FR‑002: Parse identifiers (email, LinkedIn, name + company).</li>
              <li>FR‑003: Parallel searches across Candidate, Recruiter, Company.</li>
              <li>FR‑004: Aggregate and deduplicate into Master Profiles with source tracking.</li>
              <li>FR‑005: Show relationships (applications, submissions, jobs).</li>
              <li>FR‑006: Provide contextual actions (e.g., find similar candidates).</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Pseudocode: The Power Engine Logic</h4>
            <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto">
{`function resolveProfile(query) {
  // 1. Parse & Enrich Query
  const parsedQuery = parseQueryForIdentifiers(query); // { email, linkedinUrl, name, company }

  // 2. Parallel Internal Searches
  const [candidateResults, recruiterResults, companyResults] = await Promise.all([
    Candidate.search(parsedQuery),
    Recruiter.search(parsedQuery),
    Company.search(parsedQuery.company || parsedQuery.name),
  ]);

  // 3. Aggregate & Deduplicate
  const masterProfiles = new Map();
  const processResults = (results, entity) => {
    for (const record of results) {
      const key = generateProfileKey(record.email, record.name, record.linkedin_url);
      if (!masterProfiles.has(key)) masterProfiles.set(key, { sources: [], relationships: [] });
      const profile = masterProfiles.get(key);
      mergeData(profile, record, entity);
      profile.sources.push({ entity, id: record.id });
    }
  };
  processResults(candidateResults, "Candidate");
  processResults(recruiterResults, "Recruiter");
  processResults(companyResults, "Company");

  // 4. Map Relationships
  for (const profile of masterProfiles.values()) {
    const cand = profile.sources.find(s => s.entity === "Candidate");
    if (cand) {
      const applications = await Application.filter({ candidate_id: cand.id });
      profile.relationships.push({ type: "APPLIED_TO", records: applications });
    }
  }

  // 5. Return Profiles
  return Array.from(masterProfiles.values());
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Data Model Quick Reference (in addition to live schemas) */}
      <Card>
        <CardHeader><CardTitle>Data Model Quick Reference</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <ul className="list-disc pl-5 space-y-1">
              <li>User: role_id, status, is_locked, last_active, seat.</li>
              <li>Role: name, permissions map {`{view, create, update, delete, scope}`}; cached for performance.</li>
              <li>Company: name, industry, website, location, type, status, contacts[].</li>
              <li>Candidate: name, email, phone, location, title, company, skills[], experience_years, availability, status, work_authorization, notes, tags[], bench_match_score, bench_score_details.</li>
              <li>Job: title, company_id, description, requirements, location, remote_type, employment_type, priority, status, required_skills[], due_date, salary_text, visa_restrictions.</li>
              <li>Application: candidate_id, job_id, status, interview_dates[], match_score, score_details, notes.</li>
              <li>Submission: candidate_id, job_id, recruiter_id, status, submitted_date, follow_up_date/completed, client_feedback, notes, interview_dates[].</li>
            </ul>
          </div>
          <div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Task: title, description, assigned_to, related_entity, related_id, priority, status, due_date, tags[].</li>
              <li>Resume: candidate_id, summary, experiences[], education[], projects[], skills[], theme_color.</li>
              <li>EmailTemplate: title, subject, blocks/html_body, category, tags, is_active.</li>
              <li>Views: CandidateView/SubmissionView/TaskView with view_type, columns, filters, sort, visibility, is_default.</li>
              <li>AppSettings: email_provider, provider_connected, from_name, notes.</li>
              <li>DashboardConfig: is_global, is_active, widgets[] (entity, widget_type, group_by, date_field, filter, cols).</li>
              <li>Invoices/Expenses: invoicing fields, items[], totals; expense date, type, amount, vendor, notes.</li>
            </ul>
          </div>
          <div className="lg:col-span-2 text-xs text-slate-500">Note: See “Data Model (Live Schemas)” below for the authoritative schema pulled at runtime.</div>
        </CardContent>
      </Card>

      {/* Non‑Functional Requirements */}
      <Card id="nonfunctional">
        <CardHeader><CardTitle>Non‑Functional Requirements</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>Responsive UI for desktop and mobile.</li>
            <li>Security via role‑based permissions; platform authentication.</li>
            <li>Performance optimizations (throttled loaders, caching of roles, limited AI context windows).</li>
            <li>Reliability: allow errors to bubble for fast fixes during development.</li>
            <li>Branding: consistent gradient header and background per Layout.</li>
            <li>Email safety: Sends gated by Email Settings (provider connected).</li>
            <li>UX: ESC closes major modals; consistent focus states and keyboard support.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Data Model Overview with Live Schemas */}
      <Card id="data-model">
        <CardHeader><CardTitle>Data Model Overview</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>Key entities and relationships include Candidates, Jobs, Companies (Connections), Submissions, Applications, Tasks, Resumes, Roles, Users, DashboardConfig, Email settings, and Accounts (Invoices/Expenses). Live JSON schemas are rendered below.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Data Model (Live Schemas)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="entities-core">
              <AccordionTrigger>Core Entities</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SchemaViewer title="Candidate" entity={Candidate} />
                  <SchemaViewer title="Company" entity={Company} />
                  <SchemaViewer title="Job" entity={Job} />
                  <SchemaViewer title="Submission" entity={Submission} />
                  <SchemaViewer title="Application" entity={Application} />
                  <SchemaViewer title="Task" entity={Task} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="entities-views">
              <AccordionTrigger>Views & Config</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <SchemaViewer title="CandidateView" entity={CandidateView} />
                  <SchemaViewer title="SubmissionView" entity={SubmissionView} />
                  <SchemaViewer title="TaskView" entity={TaskView} />
                </div>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SchemaViewer title="DashboardConfig" entity={DashboardConfig} />
                  <SchemaViewer title="EmailTemplate" entity={EmailTemplate} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="entities-integrations">
              <AccordionTrigger>Integrations</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <SchemaViewer title="AppSettings" entity={AppSettings} />
                  <SchemaViewer title="InboundEmail" entity={InboundEmail} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="entities-ops">
              <AccordionTrigger>Operations & Finance</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <SchemaViewer title="Invoice" entity={Invoice} />
                  <SchemaViewer title="Expense" entity={Expense} />
                  <SchemaViewer title="JobStack" entity={JobStack} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="entities-security">
              <AccordionTrigger>Security & System</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <SchemaViewer title="Role" entity={Role} />
                  <SchemaViewer title="User (extended)" entity={UserEntity} />
                  <SchemaViewer title="AuditLog" entity={AuditLog} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="entities-content">
              <AccordionTrigger>Content & Resume</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <SchemaViewer title="Resume" entity={Resume} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="text-xs text-slate-500 mt-3">Note: All records include built‑in attributes: id, created_date, updated_date, created_by.</div>
        </CardContent>
      </Card>

      {/* Role/Permissions Matrix */}
      <Card id="permissions">
        <CardHeader><CardTitle>Role/Permissions Matrix (Summary)</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Admin:</b> View/Create/Update/Delete for all entities (scope: All). Access to Access Control, global dashboard, and shared views.</li>
            <li><b>Recruiter:</b> View most; Create/Update own by RLS; can edit Candidates and update status; limited deletes; dashboard read‑only.</li>
            <li>Client‑side: PermissionGate and listFilterFor enforce capabilities and scope; server‑side: entity RLS mirrors the rules.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card id="integrations">
        <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Core.InvokeLLM</b> — summaries, Ask AI, resume and bench scoring with strict JSON responses.</li>
            <li><b>Core.UploadFile</b> — resume/JD uploads; <b>Core.ExtractDataFromUploadedFile</b> for OCR/text extraction.</li>
            <li><b>Core.SendEmail</b> — submission emails and email blasts; gated by AppSettings (provider connected).</li>
          </ul>
          {/* Inbound email ingestion removed from this app. */}
        </CardContent>
      </Card>

      {/* Acceptance Criteria */}
      <Card id="acceptance">
        <CardHeader><CardTitle>Acceptance Criteria</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-1">
          <ul className="list-disc pl-5 space-y-1">
            <li>Users can create, edit, delete, and select views; visibility and RLS enforced.</li>
            <li>Bulk scoring uses selected view; supports Draft/Open jobs; skips no‑resume; persists scores to Candidate.</li>
            <li>Preview "Edit" navigates to full edit; candidate status editable inline.</li>
            <li>Recruiter role can update Candidates; audit logs capture logins and key actions.</li>
            <li>Dashboard builder (admin) publishes global widgets; non‑admins see read‑only layout.</li>
            <li>Email features disabled until Gmail/Outlook is marked connected in Email Settings.</li>
            <li><strong>NEW: AI candidate-job matching displays top 5 ranked candidates on Job Details page with fit scores and detailed breakdowns.</strong></li>
            <li><strong>NEW: Interview assistant includes question library, per-question rating (1-5), and live score calculation (overall, avg, completion %, category breakdown).</strong></li>
            <li><strong>NEW: Dashboard AI Insights button provides on-demand pipeline analysis (skill gaps, hiring forecast, pipeline health, action items).</strong></li>
            <li><strong>NEW: My Work tab features quick time entry, draft management, tab-based navigation, and leave validation.</strong></li>
            <li><strong>NEW: Approvals tab includes AI insights (workload analysis, productivity score, leave patterns, approval efficiency, action items).</strong></li>
            <li><strong>NEW: "Paste to Add Candidate" successfully extracts and creates candidate records from unstructured text using AI.</strong></li>
            <li><strong>NEW: AI Quick Actions (⌘J) provides conversational interface for navigation, entity creation, and information retrieval, including candidate parsing from pasted text.</strong></li>
          </ul>
        </CardContent>
      </Card>

      {/* Future Enhancements */}
      <Card id="future">
        <CardHeader><CardTitle>Future Enhancements</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>Advanced semantic matching models and similarity search.</li>
            <li>Analytics for pipeline conversion and AI score impact.</li>
            <li>Version history for resumes, views, and configurations.</li>
            <li><strong>NEW: Enhanced interview features - video recording integration, automated transcription, sentiment analysis.</strong></li>
            <li><strong>NEW: Predictive analytics - candidate success prediction, time-to-fill forecasting, offer acceptance probability.</strong></li>
            <li><strong>NEW: Advanced automation - auto-scheduling interviews, smart candidate nurturing campaigns, intelligent task assignment.</strong></li>
            <li><strong>NEW: AI-driven follow-up suggestions for submissions and tasks.</strong></li>
            <li><strong>NEW: Global search with AI-powered semantic search and fuzzy matching.</strong></li>
          </ul>
        </CardContent>
      </Card>

      {/* Glossary */}
      <Card id="glossary">
        <CardHeader><CardTitle>Glossary</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Match Score</b>: Weighted alignment between resume and JD.</li>
            <li><b>Fit Score</b>: AI-calculated 0-100 score indicating candidate-job compatibility based on multiple criteria.</li>
            <li><b>Scope (All/Own)</b>: Whether a role acts on all records or only those they created.</li>
            <li><b>LLM</b>: Large Language Model used for summaries and insights.</li>
            <li><b>Live Score Calculator</b>: Real-time interview scoring system that updates as questions are answered and rated.</li>
            <li><b>Pipeline Health</b>: AI-assessed overall state of recruitment pipeline (healthy/at_risk/critical).</li>
            <li><b>Workload Analysis</b>: AI evaluation of team work hours and utilization patterns.</li>
            <li><b>AI Quick Actions</b>: Conversational AI assistant accessible via ⌘J or floating button for executing actions and answering questions.</li>
            <li><b>Paste to Add</b>: Feature to quickly create candidate records by pasting unstructured text, which AI then parses into structured fields.</li>
          </ul>
        </CardContent>
      </Card>

      {/* UI / Branding */}
      <Card id="branding">
        <CardHeader><CardTitle>UI/Branding Update Overview</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>Modern ATS styling with rounded cards, subtle shadows, and refined gradients.</li>
            <li>Global gradient header and clay‑surface background per Layout; consistent focus/hover states.</li>
            <li>Navigation includes Email Settings; sidebar supports pin/collapse and mobile drawer.</li>
          </ul>
        </CardContent>
      </Card>

      {/* UPDATED: Recent Updates Section */}
      <Card id="recent-updates">
        <CardHeader><CardTitle>Recent Updates & New Features</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Version 2.1 - AI Quick Actions & Paste to Add (Current)</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Paste to Add Candidate:</strong> New feature allowing users to paste resume text, bio, or candidate information and have AI automatically extract and create candidate records with intelligent field parsing.</li>
                <li><strong>AI Quick Actions Chat Agent:</strong> Enhanced Quick Actions button (⌘J) now opens an AI-powered conversational interface that can:</li>
                <li className="ml-8">• Parse and add candidates from pasted text</li>
                <li className="ml-8">• Navigate to any section (Add Candidate, Create Job, etc.)</li>
                <li className="ml-8">• Answer questions about recruitment workflows</li>
                <li className="ml-8">• Execute actions through natural language commands</li>
                <li className="ml-8">• Provide contextual suggestions and quick action buttons</li>
                <li><strong>Keyboard Shortcut Enhancement:</strong> ⌘J or Ctrl+J now opens AI Quick Actions globally from any page.</li>
                <li><strong>Smart Entity Creation:</strong> AI can intelligently parse unstructured text to create candidates with proper field mapping (name, email, phone, skills, experience, etc.).</li>
                <li><strong>Conversational UI:</strong> Modern chat interface with suggested actions, message history, and smooth animations.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Version 2.0 - AI & UX Enhancements</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>AI Candidate-Job Matching:</strong> Automatic top 5 candidate recommendations on Job Details page with detailed fit analysis.</li>
                <li><strong>Enhanced Interview Workflow:</strong> Question library, per-question rating, live score calculator with category breakdown.</li>
                <li><strong>Dashboard AI Insights:</strong> Merged pipeline analytics into dashboard with on-demand comprehensive analysis.</li>
                <li><strong>My Work Tab Redesign:</strong> Tab-based navigation, quick time entry, draft management, improved UX.</li>
                <li><strong>Approvals AI Insights:</strong> Workload analysis, productivity scoring, leave patterns, approval efficiency, action items.</li>
                <li><strong>Email Outreach Improvements:</strong> Graceful error handling, draft saving, better notifications.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Performance Optimizations</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Removed duplicate "Pipeline Analytics" page for streamlined navigation.</li>
                <li>Enhanced role caching (15-minute TTL) for reduced API calls.</li>
                <li>Improved data loading guards across dashboard and approval pages.</li>
                <li>Optimized AI context windows for faster response times.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEW: AI Quick Actions Feature Details */}
      <Card id="ai-quick-actions">
        <CardHeader><CardTitle>AI Quick Actions - Detailed Specification</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Overview</h4>
              <p>AI Quick Actions transforms the traditional quick action button into an intelligent conversational assistant that understands natural language and can perform complex operations through simple chat interactions.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Key Capabilities</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Natural Language Understanding:</strong> Processes user requests in conversational language and determines intent.</li>
                <li><strong>Context-Aware Actions:</strong> Understands current user role and permissions to provide relevant suggestions.</li>
                <li><strong>Multi-Intent Support:</strong> Handles various request types:</li>
                <li className="ml-8">• Navigation requests ("show me candidates", "go to jobs page")</li>
                <li className="ml-8">• Entity creation ("add a candidate named John Doe")</li>
                <li className="ml-8">• Information queries ("how do I create a new job?")</li>
                <li className="ml-8">• Bulk text parsing ("paste candidate: John Doe, Software Engineer...")</li>
                <li><strong>Intelligent Data Extraction:</strong> When pasting candidate information, AI extracts:</li>
                <li className="ml-8">• Contact details (name, email, phone)</li>
                <li className="ml-8">• Professional info (current title, company, years of experience)</li>
                <li className="ml-8">• Technical skills (programming languages, frameworks, tools)</li>
                <li className="ml-8">• Location and work authorization</li>
                <li className="ml-8">• Professional summary</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Technical Implementation</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>LLM Integration:</strong> Uses Core.InvokeLLM with structured JSON schema for reliable responses.</li>
                <li><strong>Action Types:</strong> navigate, create_candidate, create_job, create_company, create_task, search, none.</li>
                <li><strong>State Management:</strong> Maintains conversation history for context.</li>
                <li><strong>Error Handling:</strong> Graceful fallback responses when AI processing fails.</li>
                <li><strong>Permissions Check:</strong> Validates user permissions before executing actions.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">User Experience Flow</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>User clicks floating AI button (bottom-right) or presses ⌘J / Ctrl+J</li>
                <li>Chat modal opens with welcome message and suggested quick actions</li>
                <li>User types request or pastes candidate information</li>
                <li>AI processes request, showing "Thinking..." indicator</li>
                <li>AI responds with conversational message</li>
                <li>If actionable, AI executes operation (navigate, create entity, etc.)</li>
                <li>Success notification confirms completion</li>
                <li>User can continue conversation or close modal</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Example Interactions</h4>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded">
                  <p className="font-medium">User: "Add a candidate named John Doe"</p>
                  <p className="text-slate-600 text-xs mt-1">AI: "I'll help you add a new candidate. Opening the Candidates page with the add form..."</p>
                  <p className="text-xs text-blue-600 mt-1">→ Navigates to Candidates page and triggers add form</p>
                </div>
                
                <div className="p-3 bg-slate-50 rounded">
                  <p className="font-medium">User: "Manikishore Dasari, is a highly skilled Senior Java/J2EE Full Stack Developer with over 11+ years..."</p>
                  <p className="text-slate-600 text-xs mt-1">AI: "I've extracted the candidate information! Creating a new candidate record for Manikishore Dasari with 11 years of experience..."</p>
                  <p className="text-xs text-blue-600 mt-1">→ Creates candidate with parsed data and notifies success</p>
                </div>

                <div className="p-3 bg-slate-50 rounded">
                  <p className="font-medium">User: "How do I create a new job posting?"</p>
                  <p className="text-slate-600 text-xs mt-1">AI: "To create a new job posting: 1. Go to the Jobs page, 2. Click 'Add Job' button, 3. Fill in the job details including title, company, requirements..."</p>
                  <p className="text-xs text-blue-600 mt-1">→ Provides helpful information without taking action</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEW: Paste to Add Feature Details */}
      <Card id="paste-to-add">
        <CardHeader><CardTitle>Paste to Add Candidate - Detailed Specification</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Overview</h4>
              <p>Paste to Add provides a dedicated interface for quickly adding candidates by pasting resume text, LinkedIn profiles, or any candidate information. AI automatically extracts structured data eliminating manual form filling.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Access Points</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Candidates Page:</strong> New "Paste to Add" button in the header toolbar (purple gradient styling).</li>
                <li><strong>AI Quick Actions:</strong> Can also trigger through conversational commands.</li>
                <li><strong>Keyboard Shortcut:</strong> Available through suggested actions in AI Quick Actions modal.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Data Extraction Intelligence</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Contact Information:</strong></li>
                <li className="ml-8">• Extracts first_name and last_name from beginning of text</li>
                <li className="ml-8">• Identifies email addresses using pattern matching</li>
                <li className="ml-8">• Finds phone numbers in various formats</li>
                <li><strong>Professional Details:</strong></li>
                <li className="ml-8">• Current title and company from context</li>
                <li className="ml-8">• Years of experience from mentions like "11+ years", "5 years of experience"</li>
                <li className="ml-8">• Location from city/state mentions</li>
                <li><strong>Technical Skills:</strong></li>
                <li className="ml-8">• Identifies programming languages, frameworks, tools</li>
                <li className="ml-8">• Creates skills array automatically</li>
                <li className="ml-8">• Recognizes technology stacks and versions</li>
                <li><strong>Work Authorization:</strong></li>
                <li className="ml-8">• Detects mentions of H1B, Green Card, US Citizen, etc.</li>
                <li className="ml-8">• Maps to work_authorization enum values</li>
                <li><strong>Summary:</strong></li>
                <li className="ml-8">• Extracts professional summary or bio</li>
                <li className="ml-8">• Original pasted text stored in notes field</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">User Interface Features</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Large Text Area:</strong> 300px minimum height for pasting long resumes.</li>
                <li><strong>Clipboard Button:</strong> One-click paste from system clipboard.</li>
                <li><strong>Character Counter:</strong> Shows how much text has been entered.</li>
                <li><strong>Example Text:</strong> Helpful example showing what to paste.</li>
                <li><strong>Extraction Preview:</strong> Shows what AI will extract before processing.</li>
                <li><strong>Parse & Add Button:</strong> Gradient purple-to-blue styling with Sparkles icon.</li>
                <li><strong>Loading States:</strong> Shows "Parsing with AI..." while processing.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Example Input (from requirement)</h4>
              <div className="p-3 bg-slate-50 rounded text-xs font-mono overflow-auto">
{`Manikishore Dasari, is a highly skilled Senior Java/J2EE 
Full Stack Developer with over 11+ years of experience...

Core Expertise Includes:
Full Stack Development using Java, J2EE, Spring Boot, 
Hibernate, Microservices, RESTful APIs

Front-end expertise with Angular (4–14), ReactJS, 
JavaScript, TypeScript, HTML5, CSS3, and Bootstrap

Cloud Platforms: AWS (EC2, S3, Lambda, CloudWatch, IAM), 
Azure, and PCF (Pivotal Cloud Foundry)

📧 Email: manidasari104@gmail.com
📞 Phone: 469-722-1749`}
              </div>
              <div className="mt-2 p-3 bg-green-50 rounded text-xs">
                <p className="font-semibold mb-1">Extracted Result:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>first_name: "Manikishore"</li>
                  <li>last_name: "Dasari"</li>
                  <li>email: "manidasari104@gmail.com"</li>
                  <li>phone: "469-722-1749"</li>
                  <li>current_title: "Senior Java/J2EE Full Stack Developer"</li>
                  <li>experience_years: 11</li>
                  <li>skills: ["Java", "J2EE", "Spring Boot", "Hibernate", "Microservices", "RESTful APIs", "Angular", "ReactJS", "AWS", "Azure", ...]</li>
                  <li>status: "active"</li>
                  <li>source: "Pasted Text"</li>
                  <li>notes: [Original pasted text stored for reference]</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Validation & Error Handling</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Required Fields:</strong> Ensures first_name and last_name are extracted (AI required fields).</li>
                <li><strong>Empty Text Check:</strong> Prevents submission with no content.</li>
                <li><strong>Parse Failure:</strong> Shows friendly error message if AI cannot extract data.</li>
                <li><strong>Duplicate Detection:</strong> Could be enhanced in future to check for existing candidates.</li>
                <li><strong>Success Notification:</strong> Confirms candidate added with name.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Integration Points</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Candidates Page:</strong> Button in header toolbar opens PasteToAddCandidate modal.</li>
                <li><strong>Entity Refresh:</strong> Triggers candidate list reload and emits entity changed event.</li>
                <li><strong>Permissions:</strong> Wrapped in PermissionGate for "Candidate" create action.</li>
                <li><strong>Modal Management:</strong> State controlled by showPasteToAdd in Candidates page.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
