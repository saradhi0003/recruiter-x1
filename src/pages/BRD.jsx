import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText, Target, Users, Zap, Shield, Database, GitBranch,
  Search, ChevronDown, ChevronUp, Sparkles, MailPlus, Brain,
  BookOpen, List, Code, Briefcase, Send, CheckCircle, TrendingUp,
  Layers, Server, Lock, Activity, Settings, Globe, Bot, BarChart2,
  Cpu, AlertTriangle, ArrowRight, Box, Key
} from "lucide-react";

// ── Mini Components ──────────────────────────────────────────────────────────

function Section({ id, icon: Icon, title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#2563EB]" />
          </div>
          <span className="font-semibold text-[#1E293B] text-[15px]">{title}</span>
          {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED] text-white uppercase tracking-wider">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-[#F1F5F9]">{children}</div>}
    </div>
  );
}

function InfoCard({ color = "blue", title, children, className = "" }) {
  const colors = {
    blue: "border-l-[#2563EB] bg-[#EFF6FF]",
    purple: "border-l-[#7C3AED] bg-[#F5F3FF]",
    green: "border-l-[#16A34A] bg-[#F0FDF4]",
    orange: "border-l-[#D97706] bg-[#FFFBEB]",
    red: "border-l-[#DC2626] bg-[#FEF2F2]",
    slate: "border-l-[#475569] bg-[#F8FAFC]",
    pink: "border-l-[#DB2777] bg-[#FDF2F8]",
  };
  return (
    <div className={`border-l-4 rounded-r-lg p-4 ${colors[color]} ${className}`}>
      {title && <p className="font-semibold text-[13px] mb-2">{title}</p>}
      <div className="text-[13px] space-y-1">{children}</div>
    </div>
  );
}

function FieldRow({ name, type, required, isLookup, references, description }) {
  const typeColors = {
    string: "bg-blue-100 text-blue-800", number: "bg-green-100 text-green-800",
    boolean: "bg-purple-100 text-purple-800", array: "bg-orange-100 text-orange-800",
    object: "bg-pink-100 text-pink-800", date: "bg-cyan-100 text-cyan-800",
  };
  return (
    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] text-[12px]">
      <code className="font-mono font-semibold text-[#1E293B] min-w-[160px] shrink-0">{name}</code>
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${typeColors[type] || "bg-gray-100 text-gray-800"}`}>{type}</span>
      {required && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">required</span>}
      {isLookup && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">→ {references}</span>}
      <span className="text-[#64748B] flex-1">{description}</span>
    </div>
  );
}

function EntityBlock({ name, description, fields = [], relationships = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFC] text-left">
        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-[#2563EB]" />
          <span className="font-semibold text-[14px] text-[#1E293B]">{name}</span>
          <span className="text-[11px] text-[#94A3B8] border border-[#E2E8F0] rounded px-1.5 py-0.5">{fields.length} fields</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[#F1F5F9] space-y-3 pt-3">
          {description && <p className="text-[13px] text-[#64748B]">{description}</p>}
          <div className="space-y-1.5">
            {fields.map((f, i) => <FieldRow key={i} {...f} />)}
          </div>
          {relationships.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Relationships</p>
              <div className="space-y-1">
                {relationships.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] bg-[#EFF6FF] rounded px-3 py-1.5">
                    <span className="font-medium text-[#2563EB]">{r.type}</span>
                    <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
                    <span className="text-[#1E293B]">{r.with}</span>
                    <span className="text-[#64748B]">({r.description})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-[#F8FAFC] rounded p-2 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-[#94A3B8] mr-1 self-center">Auto fields:</span>
            {["id", "created_date", "updated_date", "created_by"].map(f => (
              <code key={f} className="text-[10px] border border-[#E2E8F0] bg-white rounded px-1.5 py-0.5">{f}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code, language = "javascript" }) {
  return (
    <pre className="bg-[#0F172A] text-[#E2E8F0] rounded-xl p-4 overflow-x-auto text-[11px] leading-relaxed font-mono">
      {code}
    </pre>
  );
}

function LayerCard({ icon: Icon, color, title, items }) {
  return (
    <div className={`border-l-4 ${color} bg-white border border-[#E2E8F0] rounded-r-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[#2563EB]" />
        <p className="font-semibold text-[13px] text-[#1E293B]">{title}</p>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-[12px] text-[#475569] flex items-start gap-2">
            <span className="text-[#94A3B8] mt-0.5">•</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const entities = {
  core: [
    {
      name: "Candidate", description: "Core entity representing job seekers, consultants, and bench talent in the recruitment pipeline.",
      fields: [
        { name: "first_name", type: "string", required: true, description: "First name" },
        { name: "last_name", type: "string", required: true, description: "Last name" },
        { name: "email", type: "string", required: true, description: "Email address" },
        { name: "phone", type: "string", description: "Phone number" },
        { name: "location", type: "string", description: "Current location" },
        { name: "linkedin_url", type: "string", description: "LinkedIn profile URL" },
        { name: "resume_url", type: "string", description: "Resume file URL (Base44 storage)" },
        { name: "skills", type: "array", description: "Technical and professional skills array" },
        { name: "experience_years", type: "number", description: "Total years of professional experience" },
        { name: "current_title", type: "string", description: "Current or most recent job title" },
        { name: "current_company", type: "string", description: "Current or most recent employer" },
        { name: "salary_expectation", type: "number", description: "Desired compensation" },
        { name: "availability", type: "string", description: "Availability (immediately | 2_weeks | 1_month | negotiable)" },
        { name: "status", type: "string", description: "Pipeline status: active | on_bench | our_bench | placed | inactive | do_not_contact | screened" },
        { name: "work_authorization", type: "string", description: "Work auth: citizen | permanent_resident | h1b | opt | other" },
        { name: "notes", type: "string", description: "Internal recruiter notes" },
        { name: "source", type: "string", description: "Sourcing channel (LinkedIn, referral, etc.)" },
        { name: "tags", type: "array", description: "Categorization tags" },
        { name: "bench_match_score", type: "number", description: "AI bulk bench score (0–100), persisted from BulkBenchScorer" },
        { name: "bench_score_details", type: "object", description: "Detailed AI scoring breakdown from bench scoring run" },
        { name: "screening_score", type: "number", description: "AI screening fit score (0–100) from CandidateScreening" },
        { name: "screening_date", type: "date", description: "Timestamp when screening was last performed" },
        { name: "screening_details", type: "object", description: "Detailed AI analysis: matching/missing qualifications, overall fit" },
        { name: "benchSalesRecruiterId", type: "string", description: "Linked bench sales recruiter user ID" },
        { name: "consultantVisaStatus", type: "string", description: "Consultant visa status picklist" },
        { name: "exclusiveCandidate", type: "boolean", description: "Exclusive representation flag" },
        { name: "archive", type: "boolean", description: "Archived (soft delete) flag" },
      ],
      relationships: [
        { type: "One-to-Many", with: "Application", description: "Candidates have multiple job applications" },
        { type: "One-to-Many", with: "Submission", description: "Candidates are submitted to multiple jobs" },
        { type: "One-to-Many", with: "Resume", description: "Candidates have versioned resumes" },
        { type: "One-to-Many", with: "OutreachMessage", description: "Candidates receive outreach messages" },
        { type: "One-to-Many", with: "InterviewSession", description: "Candidates are interviewed for jobs" },
        { type: "One-to-Many", with: "MatchFeedback", description: "AI match results tracked per candidate" },
      ]
    },
    {
      name: "Job", description: "Job openings and requirements from client companies. Drives the core matching and submission workflow.",
      fields: [
        { name: "title", type: "string", required: true, description: "Job title" },
        { name: "company_id", type: "string", required: true, isLookup: true, references: "Company", description: "Hiring company" },
        { name: "description", type: "string", description: "Full job description (HTML or text)" },
        { name: "requirements", type: "string", description: "Required qualifications" },
        { name: "location", type: "string", description: "Job location" },
        { name: "remote_type", type: "string", description: "Work arrangement: onsite | remote | hybrid" },
        { name: "employment_type", type: "string", description: "full_time | part_time | contract | contract_to_hire" },
        { name: "rate", type: "string", description: "Rate or salary (free text, e.g. '$120k–$150k')" },
        { name: "priority", type: "string", description: "Urgency: low | medium | high | urgent" },
        { name: "status", type: "string", description: "Lifecycle: draft | open | on_hold | filled | cancelled" },
        { name: "required_skills", type: "array", description: "Must-have technical skills" },
        { name: "preferred_skills", type: "array", description: "Nice-to-have skills" },
        { name: "experience_required", type: "number", description: "Minimum years of experience" },
        { name: "positions_available", type: "number", description: "Headcount to fill" },
        { name: "hiring_manager", type: "string", description: "Client hiring manager name" },
        { name: "due_date", type: "date", description: "Target fill date" },
        { name: "requester_email", type: "string", description: "Original requester email (parsed from inbound email)" },
        { name: "requester_name", type: "string", description: "Original requester name" },
        { name: "visa_restrictions", type: "string", description: "Work auth / visa notes from JD" },
        { name: "contract_type", type: "string", description: "Engagement model: c2c | w2 | 1099 | unknown" },
        { name: "salary_text", type: "string", description: "Raw salary text as found in JD" },
      ],
      relationships: [
        { type: "Many-to-One", with: "Company", description: "Jobs belong to a company" },
        { type: "One-to-Many", with: "Application", description: "Jobs have multiple candidate applications" },
        { type: "One-to-Many", with: "Submission", description: "Jobs receive multiple recruiter submissions" },
        { type: "One-to-One", with: "JobStack", description: "Open jobs may be cloned to public job board" },
      ]
    },
    {
      name: "Company", description: "Client companies and connections. CRM-style entity with contacts and job access controls.",
      fields: [
        { name: "name", type: "string", required: true, description: "Company name" },
        { name: "industry", type: "string", description: "Industry sector" },
        { name: "website", type: "string", description: "Company website URL" },
        { name: "location", type: "string", description: "Primary office location" },
        { name: "description", type: "string", description: "Company overview" },
        { name: "type", type: "string", description: "client | internal" },
        { name: "status", type: "string", description: "active | prospect | inactive" },
        { name: "contacts", type: "array", description: "Array of {name, email, phone, title, is_primary}" },
        { name: "job_stack_access", type: "boolean", description: "Contacts receive Job Stack email notifications" },
        { name: "primary_phone", type: "string", description: "Primary contact phone (import helper)" },
      ],
      relationships: [
        { type: "One-to-Many", with: "Job", description: "Companies have multiple job openings" },
        { type: "One-to-Many", with: "Invoice", description: "Companies receive invoices" },
        { type: "One-to-Many", with: "Recruiter", description: "Company can have associated recruiters" },
      ]
    },
    {
      name: "Application", description: "Candidate applications to specific jobs. Core pipeline tracking entity.",
      fields: [
        { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Candidate" },
        { name: "job_id", type: "string", required: true, isLookup: true, references: "Job", description: "Target job" },
        { name: "status", type: "string", description: "Pipeline stage: sourced | applied | screening | submitted | interviewing | offered | hired | rejected | withdrawn" },
        { name: "stage_updated_date", type: "date", description: "Timestamp of last status change" },
        { name: "notes", type: "string", description: "Internal recruiter notes" },
        { name: "interview_dates", type: "array", description: "Array of {date, type, interviewer, notes, feedback}" },
        { name: "submitted_by", type: "string", description: "Submitting recruiter email" },
        { name: "client_feedback", type: "string", description: "Client/hiring manager feedback" },
        { name: "rejection_reason", type: "string", description: "Reason for rejection if applicable" },
        { name: "match_score", type: "number", description: "AI-generated match score (0–100)" },
        { name: "score_details", type: "object", description: "Full AI scoring breakdown: dimensions, strengths, concerns, recommendation" },
      ],
      relationships: [
        { type: "Many-to-One", with: "Candidate", description: "Application belongs to a candidate" },
        { type: "Many-to-One", with: "Job", description: "Application is for a specific job" },
      ]
    },
  ],
  recruitment: [
    {
      name: "Submission", description: "Recruiter-initiated submissions of candidates to client jobs. Tracks follow-up and interview workflow.",
      fields: [
        { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Candidate" },
        { name: "job_id", type: "string", required: true, isLookup: true, references: "Job", description: "Target job" },
        { name: "recruiter_id", type: "string", required: true, description: "Submitting recruiter ID" },
        { name: "submitted_date", type: "date", description: "Submission timestamp" },
        { name: "status", type: "string", description: "submitted | under_review | interviewing | rejected | hired | withdrawn" },
        { name: "client_feedback", type: "string", description: "Feedback from client" },
        { name: "follow_up_date", type: "date", description: "Next follow-up date" },
        { name: "follow_up_completed", type: "boolean", description: "Follow-up completion flag" },
        { name: "interview_dates", type: "array", description: "Interview history with date, type, interviewer, feedback" },
        { name: "rate", type: "string", description: "Submitted rate (text)" },
        { name: "client", type: "string", description: "Client company name (denormalized)" },
        { name: "vendorName", type: "string", description: "Vendor/agency name" },
        { name: "technologyText", type: "string", description: "Technology stack text" },
      ],
      relationships: [
        { type: "Many-to-One", with: "Candidate", description: "Submission is for a candidate" },
        { type: "Many-to-One", with: "Job", description: "Submission is for a job" },
      ]
    },
    {
      name: "Recruiter", description: "Internal and external recruiters. Performance tracking and territory management.",
      fields: [
        { name: "first_name", type: "string", required: true, description: "First name" },
        { name: "last_name", type: "string", required: true, description: "Last name" },
        { name: "email", type: "string", required: true, description: "Email" },
        { name: "phone", type: "string", description: "Phone" },
        { name: "company_id", type: "string", isLookup: true, references: "Company", description: "Associated company" },
        { name: "role", type: "string", description: "internal | external | freelance" },
        { name: "specializations", type: "array", description: "Recruiting specializations (e.g. Java, DevOps)" },
        { name: "territory", type: "string", description: "Geographic territory" },
        { name: "performance_metrics", type: "object", description: "placements_this_month, placements_this_year, revenue_generated" },
        { name: "commission_rate", type: "number", description: "Commission percentage" },
        { name: "status", type: "string", description: "active | inactive | on_leave" },
        { name: "is_marketing", type: "boolean", description: "Receives job marketing email blasts" },
      ],
      relationships: [
        { type: "One-to-Many", with: "Submission", description: "Recruiters create submissions" },
        { type: "One-to-Many", with: "Goal", description: "Recruiters have performance goals" },
        { type: "One-to-Many", with: "Timesheet", description: "Recruiters log time" },
        { type: "One-to-Many", with: "LeaveRequest", description: "Recruiters request leave" },
      ]
    },
    {
      name: "Resume", description: "Structured resume data for candidates. Supports versioning and AI-assisted building.",
      fields: [
        { name: "candidate_id", type: "string", isLookup: true, references: "Candidate", description: "Linked candidate" },
        { name: "name", type: "string", required: true, description: "Full display name" },
        { name: "headline", type: "string", description: "Short professional headline" },
        { name: "email", type: "string", description: "Contact email" },
        { name: "phone", type: "string", description: "Contact phone" },
        { name: "location", type: "string", description: "City, State" },
        { name: "summary", type: "string", description: "Professional summary paragraph" },
        { name: "experiences", type: "array", description: "Work history: [{company, role, start_date, end_date, bullets[]}]" },
        { name: "education", type: "array", description: "Education: [{school, degree, major, gpa, start_date, end_date}]" },
        { name: "projects", type: "array", description: "Projects: [{name, date, description[]}]" },
        { name: "skills", type: "array", description: "Skills keyword array" },
        { name: "theme_color", type: "string", description: "Accent color hex for resume preview" },
      ],
      relationships: [{ type: "Many-to-One", with: "Candidate", description: "Resume belongs to candidate" }]
    },
    {
      name: "OutreachMessage", description: "Tracks all communication with candidates across channels.",
      fields: [
        { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Target candidate" },
        { name: "job_id", type: "string", isLookup: true, references: "Job", description: "Related job (optional)" },
        { name: "subject", type: "string", required: true, description: "Email subject" },
        { name: "message", type: "string", required: true, description: "Message body" },
        { name: "message_type", type: "string", description: "Type of outreach (initial, follow_up, offer, etc.)" },
        { name: "channel", type: "string", description: "email | linkedin | phone | sms" },
        { name: "status", type: "string", description: "draft | sent | delivered | opened | replied" },
        { name: "response_received", type: "boolean", description: "Response flag" },
        { name: "sentiment", type: "string", description: "AI-classified response sentiment: positive | neutral | negative" },
      ],
      relationships: [
        { type: "Many-to-One", with: "Candidate", description: "Outreach to candidate" },
        { type: "Many-to-One", with: "Job", description: "Related job" },
      ]
    },
    {
      name: "InterviewSession", description: "Interview scheduling, question tracking, scoring, and AI summaries.",
      fields: [
        { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Candidate interviewed" },
        { name: "job_id", type: "string", required: true, isLookup: true, references: "Job", description: "Job being interviewed for" },
        { name: "interview_date", type: "date", required: true, description: "Interview date/time" },
        { name: "interview_type", type: "string", required: true, description: "phone_screen | technical | behavioral | panel | final" },
        { name: "interviewer", type: "string", description: "Interviewer name or email" },
        { name: "status", type: "string", description: "scheduled | completed | cancelled | no_show" },
        { name: "questions", type: "array", description: "Array of {question, category, response, score}" },
        { name: "overall_score", type: "number", description: "Calculated overall interview score (0–100)" },
        { name: "recommendation", type: "string", description: "Hiring recommendation text" },
        { name: "ai_summary", type: "string", description: "AI-generated interview summary and evaluation" },
      ],
      relationships: [
        { type: "Many-to-One", with: "Candidate", description: "Interview with candidate" },
        { type: "Many-to-One", with: "Job", description: "Interview for job" },
      ]
    },
  ],
  workflow: [
    {
      name: "Task", description: "Work items and follow-ups. Polymorphically links to any entity. Supports kanban and list views.",
      fields: [
        { name: "title", type: "string", required: true, description: "Task title" },
        { name: "description", type: "string", description: "Detailed description" },
        { name: "assigned_to", type: "string", required: true, description: "Assigned user email" },
        { name: "related_entity", type: "string", description: "Linked entity type: candidate | job | company | submission | general" },
        { name: "related_id", type: "string", description: "ID of linked entity record" },
        { name: "priority", type: "string", description: "low | medium | high | urgent" },
        { name: "status", type: "string", description: "pending | in_progress | completed | cancelled" },
        { name: "due_date", type: "date", description: "Task due date" },
        { name: "completion_notes", type: "string", description: "Notes added on completion" },
        { name: "tags", type: "array", description: "Tags for organization" },
      ],
      relationships: [{ type: "Polymorphic", with: "Candidate | Job | Company | Submission", description: "Links to any entity via related_entity + related_id" }]
    },
    {
      name: "Playbook", description: "Process documentation, best practices, and step-by-step guides. Supports AI-assisted smart search.",
      fields: [
        { name: "title", type: "string", required: true, description: "Playbook title" },
        { name: "description", type: "string", description: "Overview description" },
        { name: "category", type: "string", required: true, description: "onboarding | recruiting | client_management | procedures | templates | best_practices | interview_guides | compliance" },
        { name: "subcategory", type: "string", description: "Finer categorization" },
        { name: "documents", type: "array", description: "Linked docs: [{name, url, description, type}]" },
        { name: "steps", type: "array", description: "Process steps: [{title, description, order, checklist[], tips}]" },
        { name: "tags", type: "array", description: "Organizational tags" },
        { name: "keywords", type: "array", description: "AI search keywords" },
        { name: "usage_count", type: "number", description: "View count" },
        { name: "is_active", type: "boolean", description: "Active/published flag" },
        { name: "access_level", type: "string", description: "public | recruiter | manager | admin" },
        { name: "faqs", type: "array", description: "FAQ entries: [{question, answer}]" },
        { name: "version", type: "string", description: "Version number (e.g., '1.0')" },
      ],
      relationships: []
    },
    {
      name: "AutomationRule", description: "Event-driven workflow rules. Executes email sends or task creation on entity status transitions.",
      fields: [
        { name: "name", type: "string", required: true, description: "Rule name" },
        { name: "trigger_type", type: "string", required: true, description: "status_change | time_based | manual" },
        { name: "trigger_entity", type: "string", required: true, description: "Watching entity: Submission | Application | Task | Candidate" },
        { name: "trigger_status_from", type: "string", description: "Source status (any if omitted)" },
        { name: "trigger_status_to", type: "string", description: "Target status that fires the rule" },
        { name: "delay_minutes", type: "number", description: "Delay before executing action (browser setTimeout in current impl)" },
        { name: "action_type", type: "string", required: true, description: "send_email | create_task | send_notification" },
        { name: "email_template_id", type: "string", isLookup: true, references: "EmailTemplate", description: "Email template to use" },
        { name: "email_recipient_type", type: "string", description: "Recipient: candidate | recruiter | hiring_manager | custom" },
        { name: "email_custom_recipient", type: "string", description: "Custom email recipient address" },
        { name: "is_active", type: "boolean", description: "Rule enabled flag" },
        { name: "trigger_count", type: "number", description: "Total executions counter" },
        { name: "last_triggered", type: "date", description: "Last execution timestamp" },
      ],
      relationships: [{ type: "Many-to-One", with: "EmailTemplate", description: "Uses email template for send actions" }]
    },
    {
      name: "Goal", description: "Recruiter performance goals with progress tracking.",
      fields: [
        { name: "title", type: "string", required: true, description: "Goal title" },
        { name: "description", type: "string", description: "Detailed goal description" },
        { name: "recruiter_id", type: "string", required: true, description: "Assigned recruiter ID" },
        { name: "start_date", type: "date", required: true, description: "Goal start date" },
        { name: "end_date", type: "date", required: true, description: "Goal end date" },
        { name: "status", type: "string", description: "draft | active | completed | on_hold | cancelled" },
        { name: "progress", type: "number", description: "Progress percentage (0–100)" },
      ],
      relationships: [{ type: "Many-to-One", with: "Recruiter", description: "Goal assigned to recruiter" }]
    },
  ],
  ai: [
    {
      name: "MatchingProfile", description: "Configurable AI matching profiles with weighted criteria, model selection, and learning from feedback.",
      fields: [
        { name: "name", type: "string", required: true, description: "Profile name (e.g., 'Senior Engineer Match')" },
        { name: "job_id", type: "string", isLookup: true, references: "Job", description: "Optional specific job link" },
        { name: "job_type", type: "string", required: true, description: "technical | sales | marketing | operations | executive | general" },
        { name: "criteria_weights", type: "object", description: "Dimension weights summing to 100: {technical_skills, experience_years, role_seniority, domain_expertise, soft_skills, education, location_fit}" },
        { name: "required_skills", type: "array", description: "Skills with importance: [{skill, importance: must_have|preferred|nice_to_have, min_years}]" },
        { name: "soft_skills_keywords", type: "array", description: "Keywords to extract from profiles (e.g. 'leadership', 'autonomous')" },
        { name: "experience_range", type: "object", description: "{min_years, max_years, ideal_years}" },
        { name: "seniority_levels", type: "array", description: "Acceptable levels: intern | junior | mid | senior | lead | principal | executive" },
        { name: "ai_model", type: "string", description: "Model selection: o1 | claude-4.5 | gpt-5 | gpt-4o | auto" },
        { name: "matching_strategy", type: "string", description: "balanced | strict | lenient | learning" },
        { name: "learning_enabled", type: "boolean", description: "Adapt weights from feedback" },
        { name: "feedback_count", type: "number", description: "Total feedback entries received" },
        { name: "avg_feedback_score", type: "number", description: "Average user rating (0–5)" },
        { name: "performance_metrics", type: "object", description: "{total_matches, accepted_matches, rejected_matches, accuracy}" },
        { name: "is_active", type: "boolean", description: "Active profile flag" },
        { name: "is_default", type: "boolean", description: "Default profile for this user" },
      ],
      relationships: [{ type: "One-to-Many", with: "MatchFeedback", description: "Profile collects feedback entries" }]
    },
    {
      name: "MatchFeedback", description: "User feedback on AI match quality for continuous learning and profile improvement.",
      fields: [
        { name: "matching_profile_id", type: "string", isLookup: true, references: "MatchingProfile", description: "Profile used for match" },
        { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Matched candidate" },
        { name: "job_id", type: "string", required: true, isLookup: true, references: "Job", description: "Matched job" },
        { name: "match_score", type: "number", required: true, description: "AI-generated score (0–100)" },
        { name: "match_details", type: "object", description: "Full scoring breakdown from AI" },
        { name: "user_rating", type: "number", description: "User star rating (1–5)" },
        { name: "user_action", type: "string", description: "viewed | contacted | interviewed | hired | rejected | skipped" },
        { name: "feedback_text", type: "string", description: "Free-text feedback on match quality" },
        { name: "criteria_accuracy", type: "object", description: "Per-dimension accuracy flags: {technical_skills_accurate, experience_accurate, soft_skills_accurate, overall_fit_accurate}" },
        { name: "suggested_improvements", type: "string", description: "User suggestions for improving matching" },
        { name: "ai_model_used", type: "string", description: "Model used for this match run" },
        { name: "was_helpful", type: "boolean", description: "Overall helpfulness flag" },
      ],
      relationships: [
        { type: "Many-to-One", with: "MatchingProfile", description: "Feedback tied to matching profile" },
        { type: "Many-to-One", with: "Candidate", description: "Feedback on candidate" },
        { type: "Many-to-One", with: "Job", description: "Feedback for job" },
      ]
    },
  ],
  admin: [
    {
      name: "User", description: "System users with roles, permissions, and access state.",
      fields: [
        { name: "email", type: "string", description: "Email address (built-in, read-only)" },
        { name: "full_name", type: "string", description: "Full name (built-in, read-only)" },
        { name: "role", type: "string", description: "Built-in role: admin | user" },
        { name: "role_id", type: "string", isLookup: true, references: "Role", description: "Custom role lookup (overrides built-in for permissions)" },
        { name: "status", type: "string", description: "active | inactive | invited" },
        { name: "is_locked", type: "boolean", description: "Account locked – forced logout on next load" },
        { name: "last_active", type: "date", description: "Last activity timestamp" },
      ],
      relationships: [{ type: "Many-to-One", with: "Role", description: "User has a custom role" }]
    },
    {
      name: "Role", description: "Permission roles defining entity-level access control matrix.",
      fields: [
        { name: "name", type: "string", required: true, description: "Role display name (e.g. Admin, Recruiter)" },
        { name: "description", type: "string", description: "Role description" },
        { name: "permissions", type: "object", required: true, description: "Map of entity → {view, create, update, delete, scope: all|own}" },
      ],
      relationships: [{ type: "One-to-Many", with: "User", description: "Role assigned to users" }]
    },
    {
      name: "AuditLog", description: "System audit trail for login events and key user actions.",
      fields: [
        { name: "user_email", type: "string", required: true, description: "Acting user email" },
        { name: "action", type: "string", required: true, description: "Action performed (e.g. 'login', 'update_status')" },
        { name: "ip", type: "string", description: "IP address (fetched via ipify)" },
        { name: "user_agent", type: "string", description: "Browser user agent string" },
        { name: "meta", type: "object", description: "Additional metadata (entity type, record ID, etc.)" },
      ],
      relationships: []
    },
    {
      name: "EmailTemplate", description: "Reusable email templates for automation rules, candidate outreach, and invoices.",
      fields: [
        { name: "title", type: "string", required: true, description: "Template title" },
        { name: "subject", type: "string", description: "Email subject line" },
        { name: "category", type: "string", description: "candidate_outreach | job_marketing | invoice | follow_up | internal_announcement | custom" },
        { name: "blocks", type: "array", description: "Structured content blocks for email builder" },
        { name: "html_body", type: "string", description: "Rendered HTML for sending" },
        { name: "preview_text", type: "string", description: "Preview text for email clients" },
        { name: "tags", type: "array", description: "Searchable tags" },
        { name: "is_active", type: "boolean", description: "Active/published flag" },
      ],
      relationships: [{ type: "One-to-Many", with: "AutomationRule", description: "Templates used by automation rules" }]
    },
    {
      name: "AppSettings", description: "Application-level configuration. Email provider settings gate all email functionality.",
      fields: [
        { name: "email_provider", type: "string", required: true, description: "none | gmail | outlook" },
        { name: "provider_connected", type: "boolean", description: "OAuth connection confirmed – enables email features" },
        { name: "from_name", type: "string", description: "Default sender display name override" },
        { name: "notes", type: "string", description: "Admin notes about integration state" },
      ],
      relationships: []
    },
    {
      name: "DashboardConfig", description: "Global dashboard widget configuration. Admins define the layout; all users see it.",
      fields: [
        { name: "name", type: "string", description: "Config name" },
        { name: "description", type: "string", description: "Description" },
        { name: "widgets", type: "array", description: "Widget definitions: [{id, title, entity, widget_type, group_by, metric, cols, date_field, months, filter}]" },
        { name: "is_global", type: "boolean", description: "Global (shared with all users) flag" },
        { name: "is_active", type: "boolean", description: "Active config flag" },
      ],
      relationships: []
    },
  ],
  finance: [
    {
      name: "Invoice", description: "Client invoices for recruitment services.",
      fields: [
        { name: "invoice_number", type: "string", required: true, description: "Invoice number" },
        { name: "company_id", type: "string", required: true, isLookup: true, references: "Company", description: "Billed company" },
        { name: "issue_date", type: "date", required: true, description: "Issue date" },
        { name: "due_date", type: "date", required: true, description: "Payment due date" },
        { name: "items", type: "array", required: true, description: "Line items: [{description, quantity, rate, amount}]" },
        { name: "subtotal", type: "number", description: "Pre-tax subtotal" },
        { name: "tax_amount", type: "number", description: "Tax amount" },
        { name: "total", type: "number", description: "Final total" },
        { name: "status", type: "string", description: "draft | sent | paid | overdue | void" },
      ],
      relationships: [{ type: "Many-to-One", with: "Company", description: "Invoice billed to company" }]
    },
    {
      name: "Expense", description: "Business expense tracking with categorization.",
      fields: [
        { name: "date", type: "date", required: true, description: "Expense date" },
        { name: "name", type: "string", required: true, description: "Expense description" },
        { name: "type", type: "string", required: true, description: "Expense category" },
        { name: "amount", type: "number", required: true, description: "Amount in USD" },
        { name: "payment_method", type: "string", description: "Payment method (card, cash, wire, etc.)" },
        { name: "vendor", type: "string", description: "Vendor or payee" },
        { name: "is_recurring", type: "boolean", description: "Recurring expense flag" },
      ],
      relationships: []
    },
  ],
  supporting: [
    {
      name: "InboundEmail", description: "Pasted or uploaded inbound emails. Parsed by AI to create jobs or candidates.",
      fields: [
        { name: "from_email", type: "string", description: "Sender email" },
        { name: "to_email", type: "string", description: "Recipient email" },
        { name: "subject", type: "string", description: "Email subject" },
        { name: "body", type: "string", description: "Email body text" },
        { name: "received_date", type: "date", description: "Email received date" },
        { name: "processed", type: "boolean", description: "Processing complete flag" },
        { name: "processing_status", type: "string", description: "pending | processing | completed | failed" },
        { name: "processing_notes", type: "string", description: "AI processing notes or error details" },
        { name: "candidate_id", type: "string", isLookup: true, references: "Candidate", description: "Created/matched candidate" },
        { name: "job_id", type: "string", isLookup: true, references: "Job", description: "Created/matched job" },
      ],
      relationships: [
        { type: "Many-to-One", with: "Candidate", description: "Parsed resume creates/matches candidate" },
        { type: "Many-to-One", with: "Job", description: "Parsed JD creates/matches job" },
      ]
    },
    {
      name: "JobStack", description: "Public job board entries cloned from internal jobs. Companies with job_stack_access receive email notifications.",
      fields: [
        { name: "title", type: "string", description: "Job title" },
        { name: "description", type: "string", description: "Job description" },
        { name: "rate", type: "string", description: "Rate or salary text" },
        { name: "due_date", type: "date", description: "Target fill date" },
        { name: "employment_type", type: "string", description: "Employment type" },
        { name: "status", type: "string", description: "active | closed" },
        { name: "client", type: "string", description: "Client company name (denormalized)" },
        { name: "original_job_id", type: "string", isLookup: true, references: "Job", description: "Source internal job" },
      ],
      relationships: [{ type: "Many-to-One", with: "Job", description: "Cloned from internal job" }]
    },
    {
      name: "Timesheet", description: "Time entries logged by recruiters. Supports weekly submission and admin approval.",
      fields: [
        { name: "user_id", type: "string", required: true, description: "User email logging time" },
        { name: "date", type: "date", required: true, description: "Work date" },
        { name: "job_id", type: "string", isLookup: true, references: "Job", description: "Job worked on (optional)" },
        { name: "hours", type: "number", required: true, description: "Hours worked (0–24)" },
        { name: "notes", type: "string", description: "Description of work" },
        { name: "status", type: "string", description: "draft | submitted | approved | rejected | needs_revision" },
      ],
      relationships: []
    },
    {
      name: "LeaveRequest", description: "Leave requests submitted by recruiters. Admin approval workflow with block on time entry.",
      fields: [
        { name: "user_id", type: "string", required: true, description: "Requesting user email" },
        { name: "type", type: "string", required: true, description: "vacation | sick | personal | unpaid | other" },
        { name: "start_date", type: "date", required: true, description: "Leave start" },
        { name: "end_date", type: "date", required: true, description: "Leave end" },
        { name: "reason", type: "string", description: "Reason for leave" },
        { name: "status", type: "string", description: "pending | approved | declined | revision_requested" },
        { name: "approver_id", type: "string", description: "Approving admin user ID/email" },
        { name: "approved_date", type: "date", description: "Approval timestamp" },
      ],
      relationships: []
    },
  ],
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BRD() {
  const [activeTab, setActiveTab] = useState("document");
  const [search, setSearch] = useState("");

  const allEntities = Object.values(entities).flat();
  const totalFields = allEntities.reduce((s, e) => s + e.fields.length, 0);

  const entityGroups = [
    { key: "core", label: "Core Entities", color: "blue", items: entities.core },
    { key: "recruitment", label: "Recruitment & Talent", color: "purple", items: entities.recruitment },
    { key: "workflow", label: "Workflow & Process", color: "green", items: entities.workflow },
    { key: "ai", label: "AI & Intelligence", color: "pink", items: entities.ai },
    { key: "admin", label: "Admin & Security", color: "orange", items: entities.admin },
    { key: "finance", label: "Finance & Billing", color: "cyan", items: entities.finance },
    { key: "supporting", label: "Supporting Tables", color: "slate", items: entities.supporting },
  ];

  const filteredGroups = entityGroups.map(g => ({
    ...g,
    items: g.items.filter(e =>
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
      e.fields.some(f => f.name.toLowerCase().includes(search.toLowerCase()) || (f.description || "").toLowerCase().includes(search.toLowerCase()))
    )
  })).filter(g => g.items.length > 0);

  const tabs = [
    { id: "document", label: "Document", icon: FileText },
    { id: "architecture", label: "Architecture", icon: Layers },
    { id: "datamodel", label: "Data Model", icon: Database },
    { id: "ai", label: "AI & LLMs", icon: Brain },
    { id: "security", label: "Security", icon: Shield },
    { id: "api", label: "API Reference", icon: Code },
  ];

  const colorBadge = { blue: "bg-blue-100 text-blue-800", purple: "bg-purple-100 text-purple-800", green: "bg-green-100 text-green-800", pink: "bg-pink-100 text-pink-800", orange: "bg-orange-100 text-orange-800", cyan: "bg-cyan-100 text-cyan-800", slate: "bg-slate-100 text-slate-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-[#1E293B]" style={{ fontFamily: "var(--font-display)" }}>Recruiter X — Business Requirements Document</h1>
                <p className="text-[13px] text-[#94A3B8]">Full system architecture · Data model · AI features · Security · API reference · As of April 2026</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2">
              <p className="text-[20px] font-bold text-[#2563EB]">{allEntities.length}</p>
              <p className="text-[11px] text-[#94A3B8]">Entities</p>
            </div>
            <div className="text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2">
              <p className="text-[20px] font-bold text-[#7C3AED]">{totalFields}</p>
              <p className="text-[11px] text-[#94A3B8]">Fields</p>
            </div>
            <div className="text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2">
              <p className="text-[20px] font-bold text-[#16A34A]">14</p>
              <p className="text-[11px] text-[#94A3B8]">AI Features</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-5 border-b border-[#E2E8F0] -mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${activeTab === t.id ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#64748B] hover:text-[#1E293B]"}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DOCUMENT TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "document" && (
        <div className="space-y-3">
          <Section id="scope" icon={Target} title="Scope & Overview" defaultOpen>
            <div className="space-y-4 text-[13px]">
              <p className="text-[#475569] leading-relaxed">
                <strong className="text-[#1E293B]">Recruiter X</strong> is a full-stack recruitment operations platform built as a React + Base44 application. It covers the complete recruitment lifecycle — from candidate sourcing, resume parsing, and AI-assisted matching, through submission tracking, interview coordination, placement, and invoicing — for staffing agencies and internal recruiting teams.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoCard color="blue" title="Platform Stack">
                  <li>React 18 + Vite + Tailwind CSS</li>
                  <li>React Router v7 (SPA)</li>
                  <li>Base44 BaaS (entities, auth, storage)</li>
                  <li>Base44 serverless functions (Deno)</li>
                  <li>@tanstack/react-query for data fetching</li>
                  <li>framer-motion, recharts, shadcn/ui</li>
                </InfoCard>
                <InfoCard color="purple" title="Functional Domains">
                  <li>Recruitment operations (candidates, jobs, submissions)</li>
                  <li>Resume & talent intelligence (Studio, AI scoring)</li>
                  <li>Communication (templates, blasts, inbox)</li>
                  <li>Workflow & process (tasks, playbooks, automation)</li>
                  <li>Finance (invoices, expenses)</li>
                  <li>Admin & governance (RBAC, audit, settings)</li>
                </InfoCard>
                <InfoCard color="green" title="Key Design Decisions">
                  <li>Frontend-heavy orchestration (workflow in React)</li>
                  <li>BaaS-style backend — all data via Base44 SDK</li>
                  <li>AI-first augmentation across all major flows</li>
                  <li>Mixed internal/public surfaces in one app</li>
                  <li>Permission-aware UI + server-side RLS</li>
                  <li>Right-side preview panel for quick context</li>
                </InfoCard>
              </div>
            </div>
          </Section>

          <Section id="users" icon={Users} title="2. Users & Roles">
            <div className="space-y-4 text-[13px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard color="blue" title="Admin">
                  <li>Full access to all entities and all records</li>
                  <li>Manage Roles, DashboardConfig, AppSettings</li>
                  <li>Create/edit global dashboards and shared views</li>
                  <li>Approve timesheets and leave requests</li>
                  <li>Access audit logs, access control, AI Agents, Email Blast</li>
                  <li>Invite and manage all users</li>
                </InfoCard>
                <InfoCard color="purple" title="Recruiter (User)">
                  <li>View most records; create/update own records</li>
                  <li>Full Candidate create + update (status, notes, scores)</li>
                  <li>Submit timesheets; create/view own leave requests</li>
                  <li>Access to Jobs, Companies, Submissions (own scope)</li>
                  <li>Limited delete by scope; cannot access admin pages</li>
                  <li>Bulk scoring and saved views per visibility</li>
                </InfoCard>
              </div>
              <InfoCard color="slate" title="Permission Matrix (per entity)">
                <p className="mb-2">Each entity in Role.permissions has: <code className="bg-white px-1 rounded border">{"{ view, create, update, delete, scope: 'all'|'own' }"}</code></p>
                <li><strong>scope: 'own'</strong> — enforces created_by = user.email filter client-side; RLS mirrors server-side</li>
                <li><strong>scope: 'all'</strong> — user can see and act on all records of that entity</li>
                <li>PermissionsProvider resolves matrix and exposes <code>can(entity, action)</code> and <code>listFilterFor(entity)</code></li>
                <li>Special RLS exceptions: Task → assigned_to, Submission → recruiter_id</li>
              </InfoCard>
            </div>
          </Section>

          <Section id="features" icon={Sparkles} title="3. Functional Requirements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
              {[
                { title: "3.1 Dashboard", items: ["KPI metrics: active roles, pipeline count, monthly placements", "Pipeline funnel with conversion rates per stage", "Today's Tasks panel with inline complete", "Recent Candidates table with AI scores and stage", "AI Insights panel (live + on-demand LLM analysis)", "Tab views: Overview, Pipeline, Activity", "Admin: configurable global widget dashboard (KPI, Bar, Pie, Line, Stacked)", "Custom widget drag-and-drop reordering"] },
                { title: "3.2 Candidates", items: ["Searchable talent pool with saved views and column customization", "Bulk operations: status update, delete, scoring", "Paste-to-Add from resume text or LinkedIn bio (AI extraction)", "Bulk Resume Upload with PDF extraction and deduplication", "AI Candidate Screening (fit score + analysis)", "AI Candidate Summary panel with regenerate and Q&A", "AI Enrichment: auto-fill missing profile fields", "Duplicate detection and merge assistance", "Right-side preview panel with inline status edit"] },
                { title: "3.3 Jobs", items: ["List with search, saved views, priority and status filters", "Careers sync: open jobs published via syncJobToCareers function", "Email Blast to marketing recruiters or selected candidates", "AI Candidate Matching: top-N ranked candidates with scores", "Auto-matching agent trigger on job creation", "Job Stack cloning for public job board", "Company job stack email notifications on new openings", "Inbound email parsing to auto-create jobs"] },
                { title: "3.4 Submissions / Applications", items: ["Create submission with candidate + job + recruiter", "Kanban and list views with drag-and-drop status updates", "Saved views with filters, columns, sort, and visibility controls", "Follow-up date tracking with overdue indicators", "Auto-create follow-up Task on submission creation", "Automation rules fire on status transitions", "Client feedback tracking per submission", "Interview date history with feedback per round"] },
                { title: "3.5 Resume Studio", items: ["Build tab: inline form editor + live PDF-style preview", "AI Resume Builder: generate tailored JSON resume from JD", "Score tab: paste/upload JD and resume, get weighted fit score", "Version comparison: side-by-side diff of resume versions", "JD-Resume compare: match strengths and gaps", "Scoring model: Hard Skills > Education > Job Title > Soft Skills", "Export to PDF; theme color customization"] },
                { title: "3.6 AI Assistant (Global)", items: ["Floating launcher on every authenticated page", "Loads page-aware context (candidates, jobs, applications)", "Conversational Q&A with suggested quick prompts", "Action planning: AI determines intent and executes CRUD", "AI Quick Actions (⌘J): natural language shortcut layer", "Supports: navigate, create_candidate, create_job, create_task, search"] },
                { title: "3.7 Email Inbox", items: ["Paste or upload inbound email content", "AI parses job requirement emails → creates/updates Job", "AI parses resume emails → creates/updates Candidate + Application", "Processing status transitions with notes", "Linked to created records for traceability"] },
                { title: "3.8 My Work & Approvals", items: ["Quick time entry form (saves as draft)", "Weekly timesheet view with daily hour grid", "Leave requests with type, date range, reason", "Leave validation: blocks time entry on leave dates", "Approvals page: batch approve timesheets and leaves", "AI Insights on workload, productivity, leave patterns", "Auto-notify admins on timesheet submission"] },
                { title: "3.9 Playbooks", items: ["Categorized process documentation library", "Step-by-step guides with checklists and tips", "Document attachments (PDF, video, link, template)", "AI Smart Search: semantic search across playbooks", "Contextual Suggestions: AI recommends relevant playbooks", "Version history and changelog tracking", "Access level control: public | recruiter | manager | admin"] },
                { title: "3.10 Automation Rules", items: ["Trigger: entity status change (e.g. Submission → submitted)", "Actions: send_email via template, create_task, send_notification", "Configurable delay in minutes (browser setTimeout)", "Recipient types: candidate, recruiter, hiring_manager, custom", "Active/inactive toggle; trigger count and last-triggered tracking", "Visual rule builder with entity and status selectors"] },
                { title: "3.11 Finance", items: ["Invoices: line items, tax, totals, status lifecycle", "Email invoice to company contacts via template", "Invoice summary: pending and received totals", "Expenses: category, date, amount, vendor, recurring flag", "Permission-gated: view/create controlled by role"] },
                { title: "3.12 Access Control", items: ["User management: search, invite, role assignment, lock/unlock", "Role builder: toggle view/create/update/delete per entity", "Scope selector: all or own per entity", "Audit log viewer: login events, user actions, IP, user agent", "Auto-logout after 3 hours of inactivity", "Forced logout on locked account (detected on next load)"] },
              ].map(({ title, items }) => (
                <div key={title} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <p className="font-semibold text-[13px] text-[#1E293B]">{title}</p>
                  </div>
                  <ul className="p-4 space-y-1.5">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-[#475569]">
                        <CheckCircle className="w-3 h-3 text-[#16A34A] mt-0.5 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section id="nonfunctional" icon={Settings} title="4. Non-Functional Requirements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
              <InfoCard color="blue" title="Performance">
                <li>Roles and quick stats cached (15-min TTL) to avoid redundant fetches</li>
                <li>Dashboard load guard: 30s debounce on re-fetch</li>
                <li>Right-side preview loads entity data on demand (lazy)</li>
                <li>React Query for server state caching and deduplication</li>
                <li>AI calls scoped to minimum context window needed</li>
              </InfoCard>
              <InfoCard color="purple" title="Responsiveness">
                <li>Tailwind responsive layout for mobile and desktop</li>
                <li>Dedicated Mobile page with simplified task/candidate views</li>
                <li>MobileTabBar for bottom navigation on small screens</li>
                <li>Collapsible, pinnable sidebar with state persisted to localStorage</li>
              </InfoCard>
              <InfoCard color="green" title="Reliability & Error Handling">
                <li>Errors bubble to surface (no silent catch) for fast iteration</li>
                <li>Automation delays use browser setTimeout — not durable for production</li>
                <li>AI calls wrapped with loading state and user feedback</li>
                <li>File uploads via Base44 (not arbitrary storage writes)</li>
              </InfoCard>
              <InfoCard color="orange" title="UX Conventions">
                <li>ESC closes all major modals</li>
                <li>⌘K: command palette global search</li>
                <li>⌘J: AI quick actions conversational panel</li>
                <li>?: keyboard shortcuts help overlay</li>
                <li>Right-click preview panel for candidate/job/company/task/playbook</li>
                <li>Click on detail links intercepts to open preview (not navigate)</li>
              </InfoCard>
            </div>
          </Section>

          <Section id="workflows" icon={Activity} title="5. Backend Workflows (Client-Orchestrated)">
            <div className="space-y-3 text-[13px]">
              <p className="text-[#64748B]">Most workflow logic runs in React components. These are the primary orchestration flows:</p>
              {[
                { n: "1", title: "Candidate Ingestion", steps: ["Resume file upload → Base44 UploadFile → file_url stored on Candidate", "PDF extraction via ExtractDataFromUploadedFile → structured JSON", "Email deduplication check before create", "create/update Candidate record with extracted fields", "Optional: CandidateAIEnrichment fills missing fields via InvokeLLM"] },
                { n: "2", title: "Job Publishing & Careers Sync", steps: ["Job create/update with status='open'", "Optional: clone to JobStack for public job board", "Notify companies with job_stack_access via email", "Invoke syncJobToCareers backend function → POST to talentstack.org/api/jobs", "On status change to filled/cancelled: update or remove from public board"] },
                { n: "3", title: "Email Inbox Parsing", steps: ["User pastes or uploads inbound email content", "Saved as InboundEmail with processing_status='pending'", "AI (InvokeLLM) detects: job requirement or resume email", "Job path: extract title, skills, company, rate → create/update Job", "Resume path: extract candidate fields → create/update Candidate → create Application"] },
                { n: "4", title: "Automation Rule Execution", steps: ["User action changes entity status (e.g. Submission → submitted)", "executeAutomation loads active AutomationRule rows matching trigger", "For each match: delay via setTimeout, then execute action", "send_email: render EmailTemplate + send via SendEmail integration", "create_task: create Task record linked to the entity", "Update AutomationRule.trigger_count and last_triggered"] },
                { n: "5", title: "AI Candidate Matching", steps: ["Recruiter opens Job → Advanced Matching tab", "Fetch all active Candidates", "For each candidate: call InvokeLLM with job + candidate data + MatchingProfile weights", "Receive structured score: dimensions, strengths, concerns, recommendation", "Save MatchFeedback record; user rates → profile learns", "Top candidates shown ranked by score with visual breakdown"] },
                { n: "6", title: "Bulk Bench Scoring", steps: ["Recruiter selects Candidate View (default: status=our_bench)", "Selects open/draft Job to score against", "For each candidate with resume_url: call InvokeLLM with resume + job", "Skip candidates without resume (mark Skipped)", "Persist bench_match_score + bench_score_details to Candidate", "Progress bar UI with per-candidate status"] },
              ].map(w => (
                <div key={w.n} className="border border-[#E2E8F0] rounded-xl p-4">
                  <p className="font-semibold text-[#1E293B] mb-2">{w.n}. {w.title}</p>
                  <ol className="space-y-1 ml-2">
                    {w.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-[#475569]">
                        <span className="text-[#2563EB] font-semibold shrink-0">{i + 1}.</span>{s}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </Section>

          <Section id="integrations" icon={Zap} title="6. Integrations">
            <div className="space-y-3 text-[13px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "Core.InvokeLLM", color: "purple", desc: "Primary AI integration. Used for: candidate summaries, screening scores, bench scoring, resume scoring, JD comparison, outreach drafting, interview assistance, duplicate detection, email blast content, playbook search, pipeline insights, analytics narratives.", params: "prompt, response_json_schema, add_context_from_internet, file_urls, model" },
                  { name: "Core.UploadFile", color: "blue", desc: "Upload resumes, JDs, and documents to Base44 storage. Returns file_url stored on Candidate or Resume entities.", params: "file (binary)" },
                  { name: "Core.ExtractDataFromUploadedFile", color: "green", desc: "OCR and text extraction from PDF/CSV/Excel/images. Used for resume parsing and bulk import flows.", params: "file_url, json_schema" },
                  { name: "Core.SendEmail", color: "orange", desc: "Send transactional emails. Gated by AppSettings (provider must be connected). Used for invoice emails, follow-ups, automation rule actions, and job blast.", params: "to, subject, body, from_name" },
                  { name: "Core.GenerateImage", color: "pink", desc: "AI image generation. Registered in integrations.js but not prominently used in current UI.", params: "prompt, existing_image_urls" },
                  { name: "syncJobToCareers (function)", color: "slate", desc: "Custom serverless function (Deno). Authenticates requester, loads job + company, transforms to public payload, POSTs to https://talentstack.org/api/jobs. Called when job status = open.", params: "job_id" },
                ].map(int => (
                  <div key={int.name} className={`border-l-4 ${int.color === "purple" ? "border-[#7C3AED]" : int.color === "blue" ? "border-[#2563EB]" : int.color === "green" ? "border-[#16A34A]" : int.color === "orange" ? "border-[#D97706]" : int.color === "pink" ? "border-[#DB2777]" : "border-[#475569]"} border border-[#E2E8F0] rounded-r-xl p-4`}>
                    <code className="font-mono font-semibold text-[13px] text-[#1E293B]">{int.name}</code>
                    <p className="text-[12px] text-[#475569] mt-1 mb-2">{int.desc}</p>
                    <p className="text-[11px] text-[#94A3B8]"><strong>Params:</strong> {int.params}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section id="future" icon={TrendingUp} title="7. Future Enhancements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
              <InfoCard color="blue" title="AI & Matching">
                <li>Semantic similarity search with vector embeddings</li>
                <li>Predictive analytics: time-to-fill, offer acceptance probability</li>
                <li>Auto-scheduling interviews based on availability</li>
                <li>Sentiment analysis on client feedback</li>
                <li>AI-driven follow-up suggestion engine</li>
              </InfoCard>
              <InfoCard color="purple" title="Automation & Durability">
                <li>Move automation execution from browser to durable backend workers</li>
                <li>Scheduled jobs via Base44 automations (cron/interval)</li>
                <li>Real-agent runtime for AI Agents page (currently mock)</li>
                <li>Smart nurturing campaigns with branching logic</li>
              </InfoCard>
              <InfoCard color="green" title="Communication">
                <li>Two-way email sync (Gmail/Outlook connector)</li>
                <li>Video interview recording and transcription</li>
                <li>Candidate portal for self-service applications</li>
                <li>SMS/WhatsApp outreach channel</li>
              </InfoCard>
              <InfoCard color="orange" title="Analytics & Reporting">
                <li>Pipeline conversion and funnel analytics</li>
                <li>Recruiter performance leaderboard</li>
                <li>Revenue and placement forecasting</li>
                <li>AI score impact on placement outcomes</li>
              </InfoCard>
            </div>
          </Section>

          <Section id="glossary" icon={BookOpen} title="8. Glossary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
              {[
                ["Match Score", "Weighted AI-calculated alignment (0–100) between a candidate and a job"],
                ["Bench Score", "AI score for candidates on the bench against open jobs (bench_match_score)"],
                ["Screening Score", "AI fit score from CandidateScreening (screening_score)"],
                ["Scope (All/Own)", "Permission scope — 'own' limits records to created_by; 'all' gives full access"],
                ["RLS", "Row-Level Security — server-side enforcement mirroring client permission rules"],
                ["Pipeline Health", "AI-assessed recruitment pipeline state: healthy | at_risk | critical"],
                ["AI Quick Actions", "Conversational AI panel (⌘J) for executing actions via natural language"],
                ["Paste to Add", "Quick candidate creation from unstructured resume or LinkedIn text"],
                ["MatchingProfile", "Configurable AI matching config with weighted criteria and model selection"],
                ["MatchFeedback", "User rating/action on an AI match — feeds continuous learning loop"],
                ["Job Stack", "Public job board — open jobs cloned and published for external visibility"],
                ["AutomationRule", "Event-driven rule that fires email send or task creation on status change"],
                ["Bench", "Candidates available for placement — 'on_bench' (vendor) or 'our_bench' (internal)"],
                ["InvokeLLM", "Base44 integration for calling LLMs — the primary AI execution surface"],
                ["DashboardConfig", "Saved global widget layout for the Dashboard (admin-controlled)"],
                ["Preview Panel", "Right-side sliding panel for quick entity viewing without full navigation"],
              ].map(([term, def]) => (
                <div key={term} className="flex items-start gap-2 p-2 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                  <span className="font-semibold text-[#1E293B] min-w-[160px] shrink-0">{term}</span>
                  <span className="text-[#64748B]">{def}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ── ARCHITECTURE TAB ──────────────────────────────────────────────────── */}
      {activeTab === "architecture" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LayerCard icon={Globe} color="border-[#2563EB]" title="1. Presentation Tier" items={[
              "Internal recruiter/admin SPA (React Router)",
              "Public marketing pages (Landing, Blog, Careers, Contact, Products, Services)",
              "Command palette (⌘K), AI quick actions (⌘J), keyboard shortcuts (?)",
              "Right-side preview panel (Candidate, Job, Company, Application, Task, Playbook)",
              "Dashboard with tabs, KPI cards, kanban boards, AI insights",
              "Resume Studio (build, score, compare, AI builder)",
              "Mobile-optimized pages and components",
            ]} />
            <LayerCard icon={Cpu} color="border-[#7C3AED]" title="2. Client Application Tier" items={[
              "App.jsx: AuthProvider + QueryClientProvider + BrowserRouter + VisualEditAgent + Toaster",
              "pages.config.js: page registry and routing source of truth",
              "Layout.jsx: sidebar nav, quick stats, search, preview orchestration, AI assistant",
              "PermissionsContext: role/permission matrix, list filters, can() checks",
              "AuthContext: public app settings, token validation, me() resolution",
              "NavigationTracker, NotificationToast, refreshBus, window custom events",
              "rolesCache: 15-min in-memory cache for Role entities",
            ]} />
            <LayerCard icon={Server} color="border-[#16A34A]" title="3. Platform / Backend Tier (Base44)" items={[
              "Entity store: list, filter, get, create, update, delete per entity",
              "Auth: token-based JWT, me(), logout(), redirectToLogin()",
              "Base44 integrations: InvokeLLM, SendEmail, UploadFile, ExtractDataFromUploadedFile, GenerateImage",
              "Serverless functions (Deno): syncJobToCareers",
              "File storage: UploadFile returns permanent public URL",
              "RLS enforcement: mirrors client-side permission rules server-side",
            ]} />
            <LayerCard icon={Globe} color="border-[#D97706]" title="4. External Services" items={[
              "talentstack.org/api/jobs: public careers job sync endpoint",
              "ipify.org: IP address resolution for audit logs",
              "LLM inference: via Base44 Core.InvokeLLM (provider abstracted)",
              "Email delivery: via Base44 Core.SendEmail (Gmail/Outlook-gated)",
              "Google Fonts: Bricolage Grotesque, IBM Plex Sans, JetBrains Mono",
            ]} />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
            <p className="font-semibold text-[#1E293B] text-[14px] mb-4">Key Routing & Bootstrap</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
              <InfoCard color="blue" title="App.jsx Bootstrap Order">
                <li>AuthProvider wraps everything — loads public settings first</li>
                <li>QueryClientProvider for React Query</li>
                <li>BrowserRouter + NavigationTracker</li>
                <li>AuthenticatedApp: checks isLoadingPublicSettings, isLoadingAuth</li>
                <li>Handles user_not_registered and auth_required errors</li>
                <li>Renders Layout + Routes from pagesConfig loop</li>
              </InfoCard>
              <InfoCard color="purple" title="pages.config.js">
                <li>Single source of truth for route → component mapping</li>
                <li>Internal: Dashboard, Candidates, Jobs, Companies, Submissions, Tasks, Goals, Recruiters, Consultants, Expenses, Invoices, AccessControl, AutomationRules, EmailSettings, EmailInbox, AIAgents, ResumeStudio, Playbooks, DuplicateManager, MyWork, Approvals, EmailBlast, BRD</li>
                <li>Public: Landing, Home, Products, Services, Blog, Contact, Careers</li>
                <li>Detail: CandidateDetails, CompanyDetails, JobDetails, TaskDetails, PlaybookDetails</li>
              </InfoCard>
              <InfoCard color="green" title="Layout.jsx Services">
                <li>Sidebar: collapsible (ChevronsLeft/Right), pinnable (Pin/PinOff), state in localStorage</li>
                <li>Quick Stats: active jobs, new candidates, this month placements</li>
                <li>Preview orchestration: listens for preview:open custom events</li>
                <li>Auto-logout: 3-hour inactivity timer resets on mouse/key activity</li>
                <li>Audit log: login event with IP captured once per session</li>
                <li>Auto-complete tasks on candidate/application status change</li>
                <li>Permission patch: ensures Recruiter role can update Candidates</li>
              </InfoCard>
            </div>
          </div>
        </div>
      )}

      {/* ── DATA MODEL TAB ────────────────────────────────────────────────────── */}
      {activeTab === "datamodel" && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input placeholder="Search entities, fields, descriptions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          {filteredGroups.map(group => (
            <div key={group.key} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${colorBadge[group.color]}`}>{group.label}</span>
                <span className="text-[12px] text-[#94A3B8]">{group.items.length} {group.items.length === 1 ? "entity" : "entities"}</span>
              </div>
              {group.items.map(e => <EntityBlock key={e.name} {...e} />)}
            </div>
          ))}
        </div>
      )}

      {/* ── AI TAB ────────────────────────────────────────────────────────────── */}
      {activeTab === "ai" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InfoCard color="blue" title="LLM Access Pattern">
              <p className="text-[#64748B] mb-2">All LLM calls go through Base44's <code>Core.InvokeLLM</code>. No vendor SDK is called directly. Base44 handles provider selection and model execution.</p>
              <li><strong>Default model:</strong> gpt-4o-mini (auto)</li>
              <li><strong>Premium models:</strong> o1, claude-4.5, gpt-5, gpt-4o</li>
              <li><strong>Pattern:</strong> structured JSON schema output</li>
              <li><strong>Context:</strong> page-aware data summaries as prompt context</li>
            </InfoCard>
            <InfoCard color="purple" title="Models Referenced in UI">
              <li><strong>o1:</strong> Complex multi-criteria reasoning (matching)</li>
              <li><strong>gpt-4o:</strong> Fast reliable scoring and generation</li>
              <li><strong>claude-4.5:</strong> Balanced analysis and summarization</li>
              <li><strong>gpt-5:</strong> Advanced understanding (matching profiles)</li>
              <li><strong>auto:</strong> System picks best for the task</li>
            </InfoCard>
            <InfoCard color="green" title="LLM Usage Styles">
              <li>Structured JSON extraction (resume parsing, inbox parsing)</li>
              <li>Scoring and ranking (screening, bench, matching)</li>
              <li>Summarization (candidate summary, interview recap)</li>
              <li>Content generation (outreach, email blast, resume builder)</li>
              <li>Recommendation reasoning (insights, analytics, suggestions)</li>
              <li>Duplicate detection assistance (DuplicateManager)</li>
            </InfoCard>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
            <p className="font-semibold text-[#1E293B] text-[14px] mb-4">AI Feature Inventory</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
              {[
                { n: "1", name: "AI Assistant", comp: "components/ai/Assistant", desc: "Page-aware conversational assistant. Loads context from multiple entities. Supports Q&A and action execution (create records, navigate). Floating launcher on every page." },
                { n: "2", name: "AI Quick Actions (⌘J)", comp: "components/common/AIQuickActions", desc: "Natural language shortcut layer. Detects intent: navigate, create_candidate, create_job, create_task, search. Executes actions with confirmation." },
                { n: "3", name: "Advanced Candidate Matching", comp: "components/ai/AdvancedCandidateMatching", desc: "Weighted multi-criteria matching (7 dimensions). Configurable MatchingProfile with model selection. Persists MatchFeedback for learning loop." },
                { n: "4", name: "Candidate Screening", comp: "components/ai/CandidateScreening", desc: "AI fit analysis for a candidate against a specific job. Outputs screening_score + detailed matching/missing qualifications. Stored on Candidate entity." },
                { n: "5", name: "Bulk Bench Scoring", comp: "components/ai/BulkBenchScorer", desc: "Batch AI scoring of a candidate cohort (Candidate View) against a selected job. Skips candidates without resume. Persists bench_match_score to Candidate." },
                { n: "6", name: "Advanced Scoring", comp: "components/ai/AdvancedScoring", desc: "Individual deep scoring of a candidate for a job. Detailed dimension breakdown displayed with visual progress bars." },
                { n: "7", name: "Bulk Scoring", comp: "components/ai/BulkScoring", desc: "Multi-candidate scoring in a batch operation. Used for pipeline analysis across a subset of candidates." },
                { n: "8", name: "Resume AI Assistant", comp: "components/resume/ResumeAIAssistant", desc: "In-Resume Studio AI chat. Provides suggestions for improving resume content, tailoring to JDs, and filling gaps." },
                { n: "9", name: "Resume LLM Builder", comp: "components/resume/ResumeLLMBuilder", desc: "Generates a complete structured JSON resume from a job description or free-form input. Populates all resume sections." },
                { n: "10", name: "Resume Scorer", comp: "components/resume/ResumeScorer", desc: "Paste or upload JD and resume. Calculates weighted fit score with Hard Skills, Education, Job Title, Soft Skills breakdown." },
                { n: "11", name: "Candidate AI Summary", comp: "components/ai/CandidateAISummary", desc: "Auto-generated candidate profile summary. Displayed in candidate preview/details. Supports regeneration and Q&A follow-up." },
                { n: "12", name: "Candidate AI Enrichment", comp: "components/ai/CandidateAIEnrichment", desc: "Fills missing candidate fields (title, skills, experience, location) by analyzing existing data with InvokeLLM." },
                { n: "13", name: "Candidate Outreach", comp: "components/ai/CandidateOutreach", desc: "AI-generated outreach email draft for recruiters. Personalized to candidate profile and target job. Multiple tones available." },
                { n: "14", name: "Interview Assistant", comp: "components/ai/InterviewAssistant", desc: "Question library with 5 categories, per-question scoring (1–5), live score calculator, and AI summary of the interview session." },
                { n: "15", name: "Talent Pipeline Analytics", comp: "components/ai/TalentPipelineAnalytics", desc: "AI-generated pipeline insights: skill gaps, hiring forecast, pipeline health, conversion analysis, trend narratives." },
                { n: "16", name: "Email Inbox AI Parsing", comp: "pages/EmailInbox", desc: "Detects if inbound email is a job requirement or candidate resume. Extracts structured data and creates/updates Job or Candidate + Application records." },
                { n: "17", name: "Email Blast AI Content", comp: "pages/EmailBlast", desc: "AI-generates professional campaign email body from a subject line. Includes intro, value props, CTA, signature." },
                { n: "18", name: "Playbook Smart Search", comp: "components/playbooks/PlaybookSmartSearch", desc: "Semantic search across playbooks using AI. Returns most relevant playbooks for a natural language query." },
                { n: "19", name: "Contextual Suggestions", comp: "components/playbooks/ContextualSuggestions", desc: "AI recommends relevant playbooks based on current page context or user query." },
                { n: "20", name: "Duplicate Manager", comp: "pages/DuplicateManager", desc: "AI-assisted detection of duplicate candidate or company records. Provides merge reasoning and similarity scoring." },
              ].map(f => (
                <div key={f.n} className="border border-[#E2E8F0] rounded-xl p-3">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="font-bold text-[#2563EB] shrink-0">{f.n}.</span>
                    <div>
                      <p className="font-semibold text-[#1E293B]">{f.name}</p>
                      <code className="text-[10px] text-[#94A3B8]">{f.comp}</code>
                    </div>
                  </div>
                  <p className="text-[#475569] text-[11px] ml-5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <InfoCard color="orange" title="AI Agents Status (April 2026)">
            <p className="text-[#92400E] mb-2">The AIAgents page presents a product concept and builder UI. In the current codebase it operates on mock agent data and should be treated as a partially implemented management surface, <strong>not a production-grade agent runtime</strong>. The agents/ directory contains JSON configs for job_matcher and talent_matcher but these are not yet wired to a durable execution engine.</p>
            <li>Visual agent management with performance stats (mock)</li>
            <li>Agent builder UI: trigger config, tool permissions, AI model selection</li>
            <li>Planned: real event-driven execution via Base44 entity automations</li>
          </InfoCard>
        </div>
      )}

      {/* ── SECURITY TAB ──────────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <InfoCard color="blue" title="Authentication">
                <li>Base44-hosted authentication — no custom auth backend</li>
                <li>JWT token accepted from URL param <code>access_token</code>, removed from URL after capture</li>
                <li>App validates public app settings before user auth check</li>
                <li>Login redirect: <code>base44.auth.redirectToLogin(nextUrl)</code></li>
                <li>Logout: <code>base44.auth.logout(redirectUrl)</code></li>
                <li>Auto-logout: 3-hour inactivity timer (mousemove, keydown, mousedown, touchstart)</li>
                <li>Forced logout on next load if user is_locked = true or status ≠ active</li>
              </InfoCard>
              <InfoCard color="purple" title="Authorization (RBAC)">
                <li>Built-in user.role (admin | user) + custom Role entity</li>
                <li>PermissionsProvider resolves: isAdmin, can(entity, action), listFilterFor(entity)</li>
                <li>Supported actions per entity: view, create, update, delete</li>
                <li>Scope: 'all' (full access) or 'own' (created_by filter)</li>
                <li>Special scopes: Task → assigned_to; Submission → recruiter_id</li>
                <li>PermissionGate component prevents disallowed UI elements from rendering</li>
                <li>AccessBlocker shown to locked/inactive users who slip past auth</li>
              </InfoCard>
            </div>
            <div className="space-y-3">
              <InfoCard color="green" title="Data Security">
                <li>Email sending requires AppSettings.provider_connected = true</li>
                <li>File uploads via Base44 integrations (not arbitrary storage writes)</li>
                <li>Only one custom backend function (syncJobToCareers) — validates auth before acting</li>
                <li>Audit log captures login events with IP (ipify) and user agent</li>
                <li>RLS on Base44 platform mirrors client-side permission rules server-side</li>
                <li>Sensitive entities (Role, AppSettings, AuditLog) locked to admin-only RLS</li>
              </InfoCard>
              <InfoCard color="red" title="Known Risks & Limitations">
                <li>Frontend-heavy orchestration: most workflow logic executes in the browser (session/network sensitive)</li>
                <li>Automation delays use browser setTimeout — not durable for production background jobs</li>
                <li>Client-side permission enforcement: server-side RLS not fully visible in this repo</li>
                <li>AI Agents page is a product shell on mock data — not a real execution engine</li>
                <li>Auth token handling depends on Base44 platform guarantees</li>
                <li>No server-side rate limiting on entity operations beyond Base44 platform limits</li>
              </InfoCard>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
            <p className="font-semibold text-[#1E293B] mb-3">Permission Matrix (Typical Configuration)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="text-left px-3 py-2 font-semibold text-[#475569]">Entity</th>
                    {["Admin View", "Admin Write", "Recruiter View", "Recruiter Write", "Scope"].map(h => (
                      <th key={h} className="text-center px-3 py-2 font-semibold text-[#475569]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Candidate", "✓", "✓", "✓", "✓ (update)", "all / own"],
                    ["Job", "✓", "✓", "✓", "✓", "all"],
                    ["Company", "✓", "✓", "✓", "✓", "all"],
                    ["Application", "✓", "✓", "✓ (own)", "✓ (own)", "own"],
                    ["Submission", "✓", "✓", "✓ (own)", "✓ (own)", "own (recruiter_id)"],
                    ["Task", "✓", "✓", "✓ (own)", "✓ (own)", "own (assigned_to)"],
                    ["Invoice / Expense", "✓", "✓", "✓ (if granted)", "—", "own"],
                    ["Role / AuditLog", "✓", "✓", "—", "—", "admin only"],
                    ["AppSettings", "✓", "✓", "—", "—", "admin only"],
                    ["DashboardConfig", "✓", "✓", "✓ (read)", "—", "admin write"],
                  ].map(([entity, ...cells]) => (
                    <tr key={entity} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                      <td className="px-3 py-2 font-medium text-[#1E293B]">{entity}</td>
                      {cells.map((c, i) => (
                        <td key={i} className={`px-3 py-2 text-center ${c === "✓" ? "text-[#16A34A]" : c === "—" ? "text-[#94A3B8]" : "text-[#475569]"}`}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── API TAB ────────────────────────────────────────────────────────────── */}
      {activeTab === "api" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoCard color="blue" title="Base URL & Authentication">
              <li><strong>Base URL:</strong> <code>https://api.base44.com</code></li>
              <li><strong>Auth:</strong> Bearer JWT token in Authorization header</li>
              <li><strong>Content-Type:</strong> application/json</li>
              <li>Token refreshes on activity; expires after 3 hours inactivity</li>
              <li>Existing secrets: <code>XAI_API_KEY</code> (xAI/Grok for advanced reasoning)</li>
            </InfoCard>
            <InfoCard color="green" title="SDK Usage (Frontend)">
              <p className="mb-2">Import the pre-initialized client:</p>
              <code className="block bg-white rounded border p-2 text-[11px]">{"import { base44 } from '@/api/base44Client';"}</code>
            </InfoCard>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <p className="font-semibold text-[#1E293B] text-[14px]">SDK Entity Operations</p>
            <CodeBlock code={`import { base44 } from '@/api/base44Client';

// LIST — returns array, sorted by field (prefix '-' for descending), with limit
const candidates = await base44.entities.Candidate.list('-created_date', 50);

// FILTER — by field values, with sort and limit
const activeCandidates = await base44.entities.Candidate.filter(
  { status: 'active' },
  '-updated_date',
  100
);

// GET — single record by ID
const candidate = await base44.entities.Candidate.get(candidateId);

// CREATE — returns created record with auto-generated id, created_date, etc.
const newCandidate = await base44.entities.Candidate.create({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@email.com',
  skills: ['JavaScript', 'React', 'Node.js'],
  status: 'active'
});

// UPDATE — partial update by ID, returns updated record
await base44.entities.Candidate.update(candidateId, {
  status: 'screening',
  screening_score: 87
});

// DELETE — by ID
await base44.entities.Candidate.delete(candidateId);

// BULK CREATE — array of objects
await base44.entities.Candidate.bulkCreate([
  { first_name: 'A', last_name: 'B', email: 'a@b.com' },
  { first_name: 'C', last_name: 'D', email: 'c@d.com' },
]);

// SCHEMA — returns JSON schema without built-in fields
const schema = await base44.entities.Candidate.schema();

// SUBSCRIBE — real-time updates
const unsubscribe = base44.entities.Candidate.subscribe((event) => {
  // event.type: 'create' | 'update' | 'delete'
  // event.id: record ID
  // event.data: current record data
  console.log(event.type, event.data);
});
// Call unsubscribe() to clean up`} />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <p className="font-semibold text-[#1E293B] text-[14px]">Auth & User Operations</p>
            <CodeBlock code={`import { base44 } from '@/api/base44Client';

// Get current user
const user = await base44.auth.me();
// Returns: { id, email, full_name, role, role_id, status, is_locked, ... }

// Check if authenticated
const authed = await base44.auth.isAuthenticated(); // returns boolean

// Update current user data
await base44.auth.updateMe({ role_id: 'some-role-id' });

// Logout (redirects to redirectUrl or reloads)
base44.auth.logout(redirectUrl?);

// Redirect to login
base44.auth.redirectToLogin(nextUrl?);

// Invite a user
await base44.users.inviteUser('user@example.com', 'user'); // role: 'user' | 'admin'`} />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <p className="font-semibold text-[#1E293B] text-[14px]">Integration Calls</p>
            <CodeBlock code={`import { base44 } from '@/api/base44Client';

// InvokeLLM — structured JSON output
const result = await base44.integrations.Core.InvokeLLM({
  prompt: "Analyze this candidate for the Senior React Developer role...",
  response_json_schema: {
    type: "object",
    properties: {
      score: { type: "number" },
      strengths: { type: "array", items: { type: "string" } },
      concerns: { type: "array", items: { type: "string" } },
      recommendation: { type: "string", enum: ["strong_hire", "hire", "maybe", "no_hire"] }
    }
  },
  model: "auto" // or "o1", "claude-4.5", "gpt-5", "gpt-4o"
});

// UploadFile
const { file_url } = await base44.integrations.Core.UploadFile({ file: fileBlob });

// ExtractDataFromUploadedFile
const { output } = await base44.integrations.Core.ExtractDataFromUploadedFile({
  file_url: "https://...",
  json_schema: { type: "object", properties: { name: { type: "string" }, skills: { type: "array" } } }
});

// SendEmail (requires AppSettings.provider_connected = true)
await base44.integrations.Core.SendEmail({
  to: "candidate@example.com",
  subject: "Interview Invitation",
  body: "<p>We'd like to schedule...</p>",
  from_name: "TalentStack Recruiting"
});`} />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <p className="font-semibold text-[#1E293B] text-[14px]">Backend Function: syncJobToCareers</p>
            <CodeBlock code={`// Invoke from frontend (Platform V2 — direct import)
import { syncJobToCareers } from "@/functions/syncJobToCareers";

const response = await syncJobToCareers({ job_id: "some-job-uuid" });
// Returns: { success: true, message: "Job synced" } or { error: "..." }

// ── Backend function implementation (Deno) ──
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { job_id } = await req.json();
  if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

  const job = await base44.asServiceRole.entities.Job.get(job_id);
  const company = job.company_id
    ? await base44.asServiceRole.entities.Company.get(job.company_id)
    : null;

  const payload = {
    title: job.title,
    description: job.description,
    rate: job.rate,
    location: job.location,
    remote_type: job.remote_type,
    employment_type: job.employment_type,
    required_skills: job.required_skills,
    client: company?.name || "Confidential",
    status: job.status,
  };

  const res = await fetch("https://talentstack.org/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return Response.json({ success: res.ok });
});`} />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <p className="font-semibold text-[#1E293B] text-[14px]">Entity JSON Structures</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-[12px] font-semibold text-[#475569] mb-2">Candidate (full)</p>
                <CodeBlock code={`{
  // Auto-generated
  "id": "uuid",
  "created_date": "2026-04-01T10:00:00Z",
  "updated_date": "2026-04-01T10:00:00Z",
  "created_by": "recruiter@agency.com",
  
  // Required
  "first_name": "Sarah",
  "last_name": "Chen",
  "email": "sarah.chen@email.com",
  
  // Profile
  "phone": "+1-555-0123",
  "location": "SF Bay Area",
  "linkedin_url": "https://linkedin.com/in/sarahchen",
  "resume_url": "https://storage.../resume.pdf",
  "current_title": "Sr. Full-Stack Engineer",
  "current_company": "Stripe",
  "experience_years": 8,
  "skills": ["React", "TypeScript", "Node.js", "AWS"],
  "salary_expectation": 180000,
  "availability": "2_weeks",
  "status": "active",
  "work_authorization": "citizen",
  "notes": "Strong payment infra background",
  "source": "LinkedIn",
  
  // AI scores
  "bench_match_score": 91,
  "bench_score_details": { "technical_skills": 95, "experience_level": 90 },
  "screening_score": 94,
  "screening_date": "2026-04-01T09:00:00Z",
  "screening_details": {
    "matching_qualifications": ["React", "Node.js", "AWS"],
    "missing_qualifications": ["Kubernetes"],
    "overall_fit": "Strong match"
  }
}`} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#475569] mb-2">Application (full)</p>
                <CodeBlock code={`{
  "id": "uuid",
  "created_date": "2026-04-01T10:00:00Z",
  "updated_date": "2026-04-20T14:00:00Z",
  "created_by": "recruiter@agency.com",
  
  // Required
  "candidate_id": "candidate-uuid",
  "job_id": "job-uuid",
  
  // Pipeline
  "status": "interviewing",
  "stage_updated_date": "2026-04-18T10:00:00Z",
  "submitted_by": "recruiter@agency.com",
  "client_feedback": "Excellent candidate, proceeding to final",
  
  // Interviews
  "interview_dates": [
    {
      "date": "2026-04-10T14:00:00Z",
      "type": "phone_screen",
      "interviewer": "John Smith",
      "notes": "Strong communication",
      "feedback": "Proceed to technical"
    },
    {
      "date": "2026-04-18T10:00:00Z",
      "type": "technical",
      "interviewer": "Jane Doe",
      "notes": "Excellent coding skills",
      "feedback": "Recommend hire"
    }
  ],
  
  // AI matching
  "match_score": 94,
  "score_details": {
    "technical_skills": 96,
    "experience_match": 92,
    "culture_fit": 90,
    "location_compatibility": 100,
    "strengths": ["React/Node — 8 yrs", "Stripe background"],
    "concerns": ["No Kubernetes exp"],
    "recommendation": "Strong hire"
  }
}`} />
              </div>
            </div>
          </div>

          <InfoCard color="orange" title="Rate Limits & Best Practices">
            <li>100 requests/minute per user; 1000 requests/hour per user (Base44 platform limits)</li>
            <li>Bulk operations limited to 100 records per request</li>
            <li>Use filter() with specific fields + sort + limit to minimize data transfer</li>
            <li>Cache frequently accessed data (roles via rolesCache, company lists)</li>
            <li>Use bulkCreate for mass inserts; avoid N+1 create loops</li>
            <li>Implement loading guards (dashGuard pattern) to prevent duplicate concurrent fetches</li>
            <li>React Query for automatic deduplication and background refetching</li>
          </InfoCard>
        </div>
      )}
    </div>
  );
}