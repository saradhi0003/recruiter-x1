
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Target,
  Users,
  Zap,
  Shield,
  Database,
  GitBranch,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MailPlus,
  Brain,
  BookOpen,
  List,
  Code, // Added Code icon for API reference
  Briefcase, // Added Briefcase icon for Jobs API
  Send, // Added Send icon for Applications API
  CheckCircle, // Existing icon
  TrendingUp // Existing icon
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const EntityCard = ({ entity, expanded, onToggle }) => {
  const getFieldTypeColor = (type) => {
    const colors = {
      string: "bg-blue-100 text-blue-800",
      number: "bg-green-100 text-green-800",
      boolean: "bg-purple-100 text-purple-800",
      array: "bg-orange-100 text-orange-800",
      object: "bg-pink-100 text-pink-800",
      date: "bg-cyan-100 text-cyan-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="cursor-pointer hover:bg-slate-50" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">{entity.name}</CardTitle>
            <Badge variant="outline">{entity.fields.length} fields</Badge>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        {entity.description && (
          <p className="text-sm text-slate-600 mt-2">{entity.description}</p>
        )}
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-3">Fields</h4>
            <div className="space-y-2">
              {entity.fields.map((field, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded border bg-slate-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium">{field.name}</span>
                      <Badge className={getFieldTypeColor(field.type)} variant="secondary">
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge className="bg-red-100 text-red-800">required</Badge>
                      )}
                      {field.isLookup && (
                        <Badge className="bg-indigo-100 text-indigo-800">→ {field.references}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{field.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {entity.relationships?.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Relationships
              </h4>
              <div className="space-y-2">
                {entity.relationships.map((rel, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                    <span className="font-medium">{rel.type}:</span>
                    <span>{rel.with}</span>
                    <span className="text-slate-500">({rel.description})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-100 rounded p-3">
            <p className="text-xs text-slate-600 mb-2">
              <strong>Built-in fields (auto-generated):</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">id</Badge>
              <Badge variant="outline" className="text-xs">created_date</Badge>
              <Badge variant="outline" className="text-xs">updated_date</Badge>
              <Badge variant="outline" className="text-xs">created_by</Badge>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default function BRD() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEntities, setExpandedEntities] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleEntity = (entityName) => {
    setExpandedEntities(prev => ({
      ...prev,
      [entityName]: !prev[entityName]
    }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  // Data Model Definition
  const dataModel = {
    core: [
      {
        name: "Candidate",
        description: "Core entity representing job seekers and talent in the pipeline",
        fields: [
          { name: "first_name", type: "string", required: true, description: "First name" },
          { name: "last_name", type: "string", required: true, description: "Last name" },
          { name: "email", type: "string", required: true, description: "Email address" },
          { name: "phone", type: "string", description: "Phone number" },
          { name: "location", type: "string", description: "Current location" },
          { name: "linkedin_url", type: "string", description: "LinkedIn profile URL" },
          { name: "resume_url", type: "string", description: "Resume file URL" },
          { name: "skills", type: "array", description: "Technical and professional skills" },
          { name: "experience_years", type: "number", description: "Years of experience" },
          { name: "current_title", type: "string", description: "Current job title" },
          { name: "current_company", type: "string", description: "Current employer" },
          { name: "salary_expectation", type: "number", description: "Salary expectation" },
          { name: "availability", type: "string", description: "Availability timeframe (immediately, 2_weeks, 1_month, negotiable)" },
          { name: "status", type: "string", description: "Candidate status (active, on_bench, our_bench, placed, inactive, do_not_contact, screened)" },
          { name: "work_authorization", type: "string", description: "Work authorization status" },
          { name: "notes", type: "string", description: "Internal notes" },
          { name: "bench_match_score", type: "number", description: "AI bulk bench score (0-100)" },
          { name: "screening_score", type: "number", description: "AI screening fit score (0-100)" }
        ],
        relationships: [
          { type: "One-to-Many", with: "Application", description: "Candidates can have multiple job applications" },
          { type: "One-to-Many", with: "Submission", description: "Candidates can be submitted to multiple jobs" },
          { type: "One-to-Many", with: "Resume", description: "Candidates can have multiple resume versions" },
          { type: "One-to-Many", with: "OutreachMessage", description: "Candidates receive outreach messages" }
        ]
      },
      {
        name: "Job",
        description: "Job openings and requirements from client companies",
        fields: [
          { name: "title", type: "string", required: true, description: "Job title" },
          { name: "company_id", type: "string", required: true, isLookup: true, references: "Company", description: "Company lookup" },
          { name: "description", type: "string", description: "Job description" },
          { name: "requirements", type: "string", description: "Required qualifications" },
          { name: "location", type: "string", description: "Job location" },
          { name: "remote_type", type: "string", description: "Work arrangement (onsite, remote, hybrid)" },
          { name: "employment_type", type: "string", description: "Employment type (full_time, part_time, contract, contract_to_hire)" },
          { name: "rate", type: "string", description: "Rate or salary range" },
          { name: "priority", type: "string", description: "Job priority (low, medium, high, urgent)" },
          { name: "status", type: "string", description: "Job status (draft, open, on_hold, filled, cancelled)" },
          { name: "required_skills", type: "array", description: "Required technical skills" },
          { name: "preferred_skills", type: "array", description: "Preferred additional skills" },
          { name: "experience_required", type: "number", description: "Minimum years of experience" },
          { name: "positions_available", type: "number", description: "Number of positions to fill" },
          { name: "due_date", type: "date", description: "Target fill date" }
        ],
        relationships: [
          { type: "Many-to-One", with: "Company", description: "Jobs belong to a company" },
          { type: "One-to-Many", with: "Application", description: "Jobs have multiple applications" },
          { type: "One-to-Many", with: "Submission", description: "Jobs receive multiple submissions" }
        ]
      },
      {
        name: "Company",
        description: "Client companies and internal organizations",
        fields: [
          { name: "name", type: "string", required: true, description: "Company name" },
          { name: "industry", type: "string", description: "Industry sector" },
          { name: "website", type: "string", description: "Company website" },
          { name: "location", type: "string", description: "Primary location" },
          { name: "description", type: "string", description: "Company description" },
          { name: "type", type: "string", description: "Company type (client, internal)" },
          { name: "status", type: "string", description: "Company status (active, prospect, inactive)" },
          { name: "contacts", type: "array", description: "Company contacts with roles" },
          { name: "job_stack_access", type: "boolean", description: "If true, contacts receive Job Stack emails" }
        ],
        relationships: [
          { type: "One-to-Many", with: "Job", description: "Companies have multiple job openings" },
          { type: "One-to-Many", with: "Invoice", description: "Companies receive invoices" }
        ]
      },
      {
        name: "Application",
        description: "Candidate applications to specific jobs",
        fields: [
          { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Candidate lookup" },
          { name: "job_id", type: "string", required: true, isLookup: true, references: "Job", description: "Job lookup" },
          { name: "status", type: "string", description: "Application status (sourced, applied, screening, submitted, interviewing, offered, hired, rejected, withdrawn)" },
          { name: "stage_updated_date", type: "date", description: "When status was last updated" },
          { name: "notes", type: "string", description: "Application notes" },
          { name: "interview_dates", type: "array", description: "Interview history with feedback" },
          { name: "submitted_by", type: "string", description: "Recruiter who submitted" },
          { name: "client_feedback", type: "string", description: "Feedback from client" },
          { name: "match_score", type: "number", description: "AI-generated match score (0-100)" },
          { name: "score_details", type: "object", description: "Detailed score breakdown from AI" }
        ],
        relationships: [
          { type: "Many-to-One", with: "Candidate", description: "Application belongs to a candidate" },
          { type: "Many-to-One", with: "Job", description: "Application is for a specific job" }
        ]
      }
    ],
    recruitment: [
      {
        name: "Submission",
        description: "Candidate submissions to client jobs by recruiters",
        fields: [
          { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Candidate lookup" },
          { name: "job_id", type: "string", required: true, isLookup: true, references: "Job", description: "Job lookup" },
          { name: "recruiter_id", type: "string", required: true, description: "Recruiter who made submission" },
          { name: "submitted_date", type: "date", description: "Submission date" },
          { name: "status", type: "string", description: "Submission status (submitted, under_review, interviewing, rejected, hired, withdrawn)" },
          { name: "client_feedback", type: "string", description: "Client feedback" },
          { name: "follow_up_date", type: "date", description: "Next follow-up date" },
          { name: "follow_up_completed", type: "boolean", description: "Follow-up completion flag" },
          { name: "interview_dates", type: "array", description: "Interview history" }
        ],
        relationships: [
          { type: "Many-to-One", with: "Candidate", description: "Submission is for a candidate" },
          { type: "Many-to-One", with: "Job", description: "Submission is for a job" },
          { type: "Many-to-One", with: "Recruiter", description: "Submission created by recruiter" }
        ]
      },
      {
        name: "Recruiter",
        description: "Internal and external recruiters",
        fields: [
          { name: "first_name", type: "string", required: true, description: "First name" },
          { name: "last_name", type: "string", required: true, description: "Last name" },
          { name: "email", type: "string", required: true, description: "Email address" },
          { name: "phone", type: "string", description: "Phone number" },
          { name: "role", type: "string", description: "Recruiter type (internal, external, freelance)" },
          { name: "specializations", type: "array", description: "Recruiting specializations" },
          { name: "territory", type: "string", description: "Geographic territory" },
          { name: "performance_metrics", type: "object", description: "Performance tracking metrics" },
          { name: "status", type: "string", description: "Recruiter status (active, inactive, on_leave)" }
        ],
        relationships: [
          { type: "One-to-Many", with: "Submission", description: "Recruiters create submissions" },
          { type: "One-to-Many", with: "LeaveRequest", description: "Recruiters request leave" },
          { type: "One-to-Many", with: "Timesheet", description: "Recruiters log time" }
        ]
      },
      {
        name: "Resume",
        description: "Candidate resume versions and content",
        fields: [
          { name: "candidate_id", type: "string", isLookup: true, references: "Candidate", description: "Linked candidate" },
          { name: "name", type: "string", required: true, description: "Display name" },
          { name: "headline", type: "string", description: "Professional headline" },
          { name: "email", type: "string", description: "Contact email" },
          { name: "phone", type: "string", description: "Contact phone" },
          { name: "summary", type: "string", description: "Professional summary" },
          { name: "experiences", type: "array", description: "Work experience entries" },
          { name: "education", type: "array", description: "Education entries" },
          { name: "projects", type: "array", description: "Projects list" },
          { name: "skills", type: "array", description: "Skills keywords" }
        ],
        relationships: [
          { type: "Many-to-One", with: "Candidate", description: "Resume belongs to candidate" }
        ]
      },
      {
        name: "OutreachMessage",
        description: "Communication tracking with candidates",
        fields: [
          { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Candidate ID" },
          { name: "job_id", type: "string", isLookup: true, references: "Job", description: "Related job (optional)" },
          { name: "subject", type: "string", required: true, description: "Email subject" },
          { name: "message", type: "string", required: true, description: "Message content" },
          { name: "message_type", type: "string", description: "Type of outreach" },
          { name: "channel", type: "string", description: "Communication channel (email, linkedin, phone)" },
          { name: "status", type: "string", description: "Message status (draft, sent, delivered, opened, replied)" },
          { name: "response_received", type: "boolean", description: "Response flag" },
          { name: "sentiment", type: "string", description: "Response sentiment (positive, neutral, negative)" }
        ],
        relationships: [
          { type: "Many-to-One", with: "Candidate", description: "Outreach to candidate" },
          { type: "Many-to-One", with: "Job", description: "Related to job (optional)" }
        ]
      },
      {
        name: "InterviewSession",
        description: "Interview sessions and evaluations",
        fields: [
          { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Candidate ID" },
          { name: "job_id", type: "string", required: true, isLookup: true, references: "Job", description: "Job ID" },
          { name: "interview_date", type: "date", required: true, description: "Interview date/time" },
          { name: "interview_type", type: "string", required: true, description: "Interview type (phone_screen, technical, behavioral, etc.)" },
          { name: "interviewer", type: "string", description: "Interviewer name/email" },
          { name: "status", type: "string", description: "Interview status (scheduled, completed, cancelled, no_show)" },
          { name: "questions", type: "array", description: "Interview questions and responses" },
          { name: "overall_score", type: "number", description: "Overall interview score (0-100)" },
          { name: "recommendation", type: "string", description: "Hiring recommendation" },
          { name: "ai_summary", type: "string", description: "AI-generated interview summary" }
        ],
        relationships: [
          { type: "Many-to-One", with: "Candidate", description: "Interview with candidate" },
          { type: "Many-to-One", with: "Job", description: "Interview for job" }
        ]
      }
    ],
    workflow: [
      {
        name: "Task",
        description: "Work items and follow-ups",
        fields: [
          { name: "title", type: "string", required: true, description: "Task title" },
          { name: "description", type: "string", description: "Task description" },
          { name: "assigned_to", type: "string", required: true, description: "User email assigned to" },
          { name: "related_entity", type: "string", description: "What this relates to (candidate, job, company, submission, general)" },
          { name: "related_id", type: "string", description: "ID of related entity" },
          { name: "priority", type: "string", description: "Task priority (low, medium, high, urgent)" },
          { name: "status", type: "string", description: "Task status (pending, in_progress, completed, cancelled)" },
          { name: "due_date", type: "date", description: "Due date" },
          { name: "completion_notes", type: "string", description: "Notes upon completion" }
        ],
        relationships: [
          { type: "Polymorphic", with: "Multiple", description: "Can link to Candidate, Job, Company, Submission" }
        ]
      },
      {
        name: "Playbook",
        description: "Process documentation and best practices",
        fields: [
          { name: "title", type: "string", required: true, description: "Playbook title" },
          { name: "description", type: "string", description: "Playbook description" },
          { name: "category", type: "string", required: true, description: "Category (onboarding, recruiting, procedures, etc.)" },
          { name: "documents", type: "array", description: "Linked documents and resources" },
          { name: "steps", type: "array", description: "Step-by-step process with checklists" },
          { name: "tags", type: "array", description: "Tags for organization" },
          { name: "keywords", type: "array", description: "Search keywords for AI matching" },
          { name: "usage_count", type: "number", description: "View count" },
          { name: "is_active", type: "boolean", description: "Active flag" }
        ],
        relationships: []
      },
      {
        name: "AutomationRule",
        description: "Automated workflow rules and triggers",
        fields: [
          { name: "name", type: "string", required: true, description: "Rule name" },
          { name: "trigger_type", type: "string", required: true, description: "What triggers automation (status_change, time_based, manual)" },
          { name: "trigger_entity", type: "string", required: true, description: "Which entity triggers (Submission, Application, Task)" },
          { name: "trigger_status_to", type: "string", description: "Status to trigger on" },
          { name: "action_type", type: "string", required: true, description: "Action to perform (send_email, create_task, send_notification)" },
          { name: "email_template_id", type: "string", isLookup: true, references: "EmailTemplate", description: "Email template to use" },
          { name: "is_active", type: "boolean", description: "Rule active flag" }
        ],
        relationships: [
          { type: "Many-to-One", with: "EmailTemplate", description: "Uses email template" }
        ]
      }
    ],
    ai: [
      {
        name: "MatchingProfile",
        description: "AI matching configuration profiles with weighted criteria",
        fields: [
          { name: "name", type: "string", required: true, description: "Profile name" },
          { name: "job_type", type: "string", required: true, description: "Job category" },
          { name: "criteria_weights", type: "object", description: "Custom weights for matching criteria (should sum to 100)" },
          { name: "required_skills", type: "array", description: "Skills with importance levels" },
          { name: "soft_skills_keywords", type: "array", description: "Keywords to extract from profiles" },
          { name: "ai_model", type: "string", description: "AI model to use (o1, claude-4.5, gpt-5, auto)" },
          { name: "matching_strategy", type: "string", description: "Matching strategy (balanced, strict, lenient, learning)" },
          { name: "learning_enabled", type: "boolean", description: "Learn from feedback" },
          { name: "performance_metrics", type: "object", description: "Performance tracking" }
        ],
        relationships: [
          { type: "One-to-Many", with: "MatchFeedback", description: "Has feedback entries" }
        ]
      },
      {
        name: "MatchFeedback",
        description: "User feedback on AI match quality for continuous learning",
        fields: [
          { name: "matching_profile_id", type: "string", isLookup: true, references: "MatchingProfile", description: "Profile used" },
          { name: "candidate_id", type: "string", required: true, isLookup: true, references: "Candidate", description: "Matched candidate" },
          { name: "job_id", type: "string", required: true, isLookup: true, references: "Job", description: "Matched job" },
          { name: "match_score", type: "number", required: true, description: "AI-generated score (0-100)" },
          { name: "user_rating", type: "number", description: "User rating (1-5 stars)" },
          { name: "user_action", type: "string", description: "Action taken (viewed, contacted, interviewed, hired, rejected)" },
          { name: "was_helpful", type: "boolean", description: "Helpful flag" }
        ],
        relationships: [
          { type: "Many-to-One", with: "MatchingProfile", description: "Feedback for profile" },
          { type: "Many-to-One", with: "Candidate", description: "Feedback on candidate" },
          { type: "Many-to-One", with: "Job", description: "Feedback for job" }
        ]
      }
    ],
    admin: [
      {
        name: "User",
        description: "System users with roles and permissions",
        fields: [
          { name: "email", type: "string", description: "Email (built-in)" },
          { name: "full_name", type: "string", description: "Full name (built-in)" },
          { name: "role", type: "string", description: "Built-in role (admin, user)" },
          { name: "role_id", type: "string", isLookup: true, references: "Role", description: "Custom role lookup" },
          { name: "status", type: "string", description: "Access state (active, inactive, invited)" },
          { name: "is_locked", type: "boolean", description: "Account locked flag" },
          { name: "last_active", type: "date", description: "Last active timestamp" }
        ],
        relationships: [
          { type: "Many-to-One", with: "Role", description: "User has a role" }
        ]
      },
      {
        name: "Role",
        description: "Permission roles for access control",
        fields: [
          { name: "name", type: "string", required: true, description: "Role name (e.g., Admin, Recruiter)" },
          { name: "description", type: "string", description: "Role description" },
          { name: "permissions", type: "object", required: true, description: "Map of entity permissions (view, create, update, delete, scope)" }
        ],
        relationships: [
          { type: "One-to-Many", with: "User", description: "Role assigned to users" }
        ]
      },
      {
        name: "AuditLog",
        description: "System audit trail",
        fields: [
          { name: "user_email", type: "string", required: true, description: "User email" },
          { name: "action", type: "string", required: true, description: "Action performed" },
          { name: "ip", type: "string", description: "IP address" },
          { name: "user_agent", type: "string", description: "Browser user agent" },
          { name: "meta", type: "object", description: "Extra metadata" }
        ],
        relationships: []
      },
      {
        name: "EmailTemplate",
        description: "Reusable email templates",
        fields: [
          { name: "title", type: "string", required: true, description: "Template title" },
          { name: "subject", type: "string", description: "Email subject" },
          { name: "category", type: "string", description: "Template category" },
          { name: "blocks", type: "array", description: "Structured content blocks" },
          { name: "html_body", type: "string", description: "Rendered HTML" },
          { name: "is_active", type: "boolean", description: "Active flag" }
        ],
        relationships: [
          { type: "One-to-Many", with: "AutomationRule", description: "Used by automation rules" }
        ]
      }
    ],
    finance: [
      {
        name: "Invoice",
        description: "Client invoices for services",
        fields: [
          { name: "invoice_number", type: "string", required: true, description: "Invoice number" },
          { name: "company_id", type: "string", required: true, isLookup: true, references: "Company", description: "Billed company" },
          { name: "issue_date", type: "date", required: true, description: "Issue date" },
          { name: "due_date", type: "date", required: true, description: "Due date" },
          { name: "items", type: "array", required: true, description: "Line items with quantity and price" },
          { name: "subtotal", type: "number", description: "Sum of items" },
          { name: "tax_amount", type: "number", description: "Tax amount" },
          { name: "total", type: "number", description: "Final total" },
          { name: "status", type: "string", description: "Invoice status (draft, sent, paid, overdue, void)" }
        ],
        relationships: [
          { type: "Many-to-One", with: "Company", description: "Invoice for company" }
        ]
      },
      {
        name: "Expense",
        description: "Business expenses tracking",
        fields: [
          { name: "date", type: "date", required: true, description: "Expense date" },
          { name: "name", type: "string", required: true, description: "Expense description" },
          { name: "type", type: "string", required: true, description: "Expense category" },
          { name: "amount", type: "number", required: true, description: "Amount" },
          { name: "payment_method", type: "string", description: "Payment method" },
          { name: "vendor", type: "string", description: "Vendor/Payee" },
          { name: "is_recurring", type: "boolean", description: "Recurring flag" }
        ],
        relationships: []
      }
    ]
  };

  const allEntities = [
    ...dataModel.core,
    ...dataModel.recruitment,
    ...dataModel.workflow,
    ...dataModel.ai,
    ...dataModel.admin,
    ...dataModel.finance
  ];

  const filteredEntities = allEntities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.fields.some(field => 
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const entityGroups = [
    { key: "core", label: "Core Entities", entities: dataModel.core, color: "blue" },
    { key: "recruitment", label: "Recruitment & Talent", entities: dataModel.recruitment, color: "purple" },
    { key: "workflow", label: "Workflow & Process", entities: dataModel.workflow, color: "green" },
    { key: "ai", label: "AI & Intelligence", entities: dataModel.ai, color: "pink" },
    { key: "admin", label: "Admin & Security", entities: dataModel.admin, color: "orange" },
    { key: "finance", label: "Finance & Billing", entities: dataModel.finance, color: "cyan" }
  ];

  const documentSections = [
    {
      id: "toc",
      icon: List,
      title: "Table of Contents",
      content: (
        <div className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Project Overview & Goals</li>
            <li>Users & Roles</li>
            <li>Functional Requirements</li>
            <li>Non-Functional Requirements</li>
            <li>Data Model Overview</li>
            <li>Role/Permissions Matrix</li>
            <li>Integrations</li>
            <li>Acceptance Criteria</li>
            <li>Future Enhancements</li>
            <li>Glossary</li>
            <li>UI/Branding Update Overview</li>
            <li>Recent Updates & New Features</li>
            <li>AI Quick Actions - Detailed Specification</li>
            <li>Paste to Add Candidate - Detailed Specification</li>
            <li className="text-purple-700 font-semibold">NEW: AI Agent System</li>
            <li className="text-purple-700 font-semibold">NEW: Email Blast System</li>
            <li className="text-purple-700 font-semibold">NEW: Advanced AI Matching</li>
            <li className="text-purple-700 font-semibold">NEW: API Reference & Integration</li>
          </ol>
        </div>
      )
    },
    {
      id: "overview",
      icon: Target,
      title: "1. Project Overview & Goals",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            <strong>TalentStack Recruiter X</strong> is a comprehensive recruitment management platform designed for staffing agencies
            and internal recruiting teams. The system manages the complete recruitment lifecycle from candidate sourcing
            through placement and invoicing.
          </p>

          <Card className="border-l-4 border-l-purple-500 bg-purple-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Latest Updates & Features (December 2024)
              </h4>
              <div className="space-y-2 text-sm text-purple-800">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">AI Agents:</span>
                  <span>Intelligent automation agents that trigger on entity events (e.g., job creation) to perform AI analysis, create applications, and execute complex workflows</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">Email Blast:</span>
                  <span>Mass email campaign tool for reaching all company contacts with AI-generated content and CSV export capabilities</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">Advanced Matching:</span>
                  <span>Configurable AI matching with weighted criteria, multiple reasoning models (o1, Claude 4.5, GPT-5), learning from feedback, and performance tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">AI Quick Actions:</span>
                  <span>Conversational AI assistant (⌘J) for navigation, entity creation, and candidate parsing from pasted text</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">Paste to Add:</span>
                  <span>Quick candidate creation by pasting resume text or LinkedIn bios with automatic field extraction</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <h4 className="font-semibold text-slate-900 mt-6 mb-3">Core Objectives</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• End-to-end recruitment workspace covering Candidates, Jobs, Companies (Connections), Submissions/Applications, Tasks, Invoices/Expenses, and Resumes</li>
            <li>• Saved list views with visibility controls (Private, Team, Public, Role-based) to avoid duplicates</li>
            <li>• Bulk Bench Scoring on "Our Bench" or any saved view; score persisted to Candidate</li>
            <li>• Global Preview Center with context, quick navigation, and explicit Edit navigation</li>
            <li>• LLM-powered Ask AI with page-aware context and action mode</li>
            <li>• Role-based access control and audit logging; customizable global dashboard widgets</li>
          </ul>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold">Data Model</h4>
                </div>
                <p className="text-sm text-slate-600">
                  {allEntities.length} entities with {allEntities.reduce((sum, e) => sum + e.fields.length, 0)} total fields
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <GitBranch className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold">Relationships</h4>
                </div>
                <p className="text-sm text-slate-600">
                  Complex relationship graph with lookups, one-to-many, and polymorphic links
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold">AI-Powered</h4>
                </div>
                <p className="text-sm text-slate-600">
                  Machine learning for candidate matching, screening, and workflow automation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "users",
      icon: Users,
      title: "2. Users & Roles",
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <div>
            <h4 className="font-semibold text-base mb-2">Admin</h4>
            <p>Full access to all entities; can manage Roles, DashboardConfig, and system settings. Can create global dashboards and shared views.</p>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">Recruiter</h4>
            <p>View most records; create/update own; limited deletes by scope. Can edit Candidates and update status; bulk scoring and views available per visibility.</p>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">Candidate List Views</h4>
            <p>Create views with filters, columns, sort; set default view. Visibility: Private, Team, Public, Role-based. Edit/Delete views (owner and admins only). RLS enforces visibility. Usable across pages and inside Bulk Scoring modal.</p>
          </div>
        </div>
      )
    },
    {
      id: "features",
      icon: Sparkles,
      title: "3. Functional Requirements",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.1 Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>KPIs and charts for pipeline at-a-glance</li>
                <li>Quick Actions to add key records</li>
                <li>"My Tasks Today" card with inline complete</li>
                <li>Custom Global Dashboard (Admin): Builder composes global layout</li>
                <li>Widget types: KPI, Bar, Pie, Line, Stacked</li>
                <li className="text-purple-700 font-semibold">NEW: AI Pipeline Insights with skill gap analysis, hiring forecast, pipeline health</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.2 Candidates</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Search, filter, add/edit from modal</li>
                <li>Candidate Details: Overview, Applications, Documents, Activity</li>
                <li>Related panel: Applications, Submissions, Tasks, Resumes</li>
                <li>AI Candidate Summary panel with regenerate and Q&A</li>
                <li className="text-purple-700 font-semibold">NEW: Paste to Add for quick candidate creation from text</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.3 Jobs</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>List, search, filter; view details and associated applications</li>
                <li>Track status, priority, location, compensation, due date</li>
                <li>Email Blast to marketing recruiters and selected candidates</li>
                <li className="text-purple-700 font-semibold">NEW: AI Candidate Matching with top 5 ranked candidates and fit scores</li>
                <li className="text-purple-700 font-semibold">NEW: Auto-matching agent triggers on job creation</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.4 Submissions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Create submission, status tracking, client feedback</li>
                <li>Follow-up reminders with due indicators and quick actions</li>
                <li>Auto-create next-day follow-up Task on submission create</li>
                <li>Board/List views with saved views; drag-and-drop updates status</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.5 Resume Studio</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Build tab: inline editor (left), live preview (right), zoom, save, print</li>
                <li>Score tab: paste/upload JD and Resume; compare text only</li>
                <li>AI Resume Builder panel: generate tailored JSON resume</li>
                <li>Scoring model weights: Hard Skills (highest), Education, Job Title, Soft Skills</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.6 AI Assistant (Global)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Floating launcher opens side-panel chat on every page</li>
                <li>Loads scoped context (Candidates, Jobs, Applications, etc.)</li>
                <li>Quick prompts for pipeline, overdue tasks, and top matches</li>
                <li className="text-purple-700 font-semibold">NEW: AI Quick Actions (⌘J) with conversational interface</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.7 Access Control</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Users list with search and role assignment</li>
                <li>Roles & Permissions matrix: toggle View/Create/Edit/Delete per entity</li>
                <li>Scope All/Own enforcement</li>
                <li>UI enforcement via PermissionGate; server-side RLS mirrors rules</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.8 Connections & Tasks</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Connections (Companies): lists with search/filters; details modal</li>
                <li className="text-purple-700 font-semibold">NEW: Connections Email Blast with AI content generation</li>
                <li>Consultants, Tasks, Playbooks: lists with search; create/edit per permissions</li>
                <li>Playbooks include rich details and document links</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.9 Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Email sending gated by Email Settings</li>
                <li>Provider Gmail/Outlook and connected flag</li>
                <li>All email features disabled until connected</li>
                <li>From uses current user where supported</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.10 Accounts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Invoices: create/edit items, tax, totals; email to contacts</li>
                <li>Invoices summary shows Pending and Received totals</li>
                <li>Expenses: track categories, date, amount, vendor, notes</li>
                <li>CSV import planned via backend functions</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.11 My Work (Enhanced)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Tab-Based Navigation: Overview, Quick Entry, Weekly Submit, Leave Requests</li>
                <li>Quick Stats Cards: Hours this week, approved hours, pending leave</li>
                <li>Quick Time Entry: Single-form entry saves as draft</li>
                <li>Leave Validation: Blocks time entry on leave dates</li>
                <li>Auto-Notifications: Admins notified on submissions</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.12 Approvals (Enhanced)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Quick Stats: Pending leaves, timesheets, hours, users waiting</li>
                <li>Batch Operations: "Approve All" for efficiency</li>
                <li>Weekly Grouping: Timesheets grouped by user + week</li>
                <li className="text-purple-700 font-semibold">NEW: AI Insights - Workload analysis, productivity score, leave patterns, approval efficiency</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3.13 Interview Assistant</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Question Library: Pre-built questions across 5 categories</li>
                <li>Per-Question Rating: 1-5 scale slider for each question</li>
                <li>Live Score Calculator: Auto-calculates overall score, completion %</li>
                <li>AI Summary Integration: Uses calculated scores in analysis</li>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-blue-50 border-blue-200 mt-6">
            <CardHeader>
              <CardTitle className="text-base text-blue-900">Bulk Bench Scoring</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <li>Select cohort via Candidate View (default: status=our_bench)</li>
              <li>Select any Job with status Draft or Open</li>
              <li>Skip candidates without resume; result marked as Skipped</li>
              <li>Persist bench_match_score (0-100) and bench_score_details (JSON) to Candidate</li>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200 mt-4">
            <CardHeader>
              <CardTitle className="text-base text-green-900">Preview Center & Editing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800 space-y-2">
              <li>Right-side global preview for Candidate, Job, Company, Application, Task, Playbook</li>
              <li>Explicit "Edit" actions bypass preview and navigate to full edit page</li>
              <li>Inline status update for Candidate within preview</li>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "api-reference",
      icon: Code,
      title: "API Reference & Integration",
      content: (
        <div className="space-y-6">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base">API Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-3">
              <p>
                The TalentStack Recruiter X platform provides a comprehensive REST API built on the Base44 platform,
                allowing programmatic access to all core entities and operations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded border">
                  <p className="font-semibold text-slate-900 mb-1">Base URL</p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">https://api.base44.com</code>
                </div>
                <div className="p-3 bg-white rounded border">
                  <p className="font-semibold text-slate-900 mb-1">Authentication</p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">Bearer Token (JWT)</code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Keys & Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Available API Keys</h4>
                <div className="bg-slate-50 rounded p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-100 text-green-800">SET</Badge>
                    <div>
                      <code className="text-xs bg-white px-2 py-1 rounded border">XAI_API_KEY</code>
                      <p className="text-xs text-slate-600 mt-1">xAI (Grok) API key for advanced AI reasoning</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Authentication Flow</h4>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>User authenticates via Base44 platform login</li>
                  <li>JWT token generated and stored in session</li>
                  <li>Token included in all API requests via Authorization header</li>
                  <li>Token auto-refreshes on activity; expires after 3 hours of inactivity</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Request Headers</h4>
                <pre className="text-xs bg-white rounded p-3 overflow-x-auto">
{`Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Core API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Candidates API */}
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Candidates API
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-xs">/entities/Candidate</code>
                    </div>
                    <p className="text-slate-600 text-xs mb-2">List all candidates (respects RLS permissions)</p>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-slate-500 mb-1">Query Parameters:</p>
                      <ul className="text-xs space-y-1 ml-3">
                        <li>• <code>sort</code>: Sort field (e.g., "-created_date" for descending)</li>
                        <li>• <code>limit</code>: Number of records (default: 50)</li>
                        <li>• <code>filter</code>: JSON filter object</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">POST</Badge>
                      <code className="text-xs">/entities/Candidate</code>
                    </div>
                    <p className="text-slate-600 text-xs mb-2">Create new candidate</p>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-slate-500 mb-1">Required fields:</p>
                      <code className="text-xs">first_name, last_name, email</code>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-yellow-100 text-yellow-800">PUT</Badge>
                      <code className="text-xs">/entities/Candidate/:id</code>
                    </div>
                    <p className="text-slate-600 text-xs">Update candidate by ID</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-red-100 text-red-800">DELETE</Badge>
                      <code className="text-xs">/entities/Candidate/:id</code>
                    </div>
                    <p className="text-slate-600 text-xs">Delete candidate by ID</p>
                  </div>
                </div>
              </div>

              {/* Jobs API */}
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Jobs API
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-xs">/entities/Job</code>
                    </div>
                    <p className="text-slate-600 text-xs mb-2">List all jobs</p>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-slate-500 mb-1">Common filters:</p>
                      <ul className="text-xs space-y-1 ml-3">
                        <li>• <code>{"{\"status\": \"open\"}"}</code> - Active jobs only</li>
                        <li>• <code>{"{\"priority\": \"high\"}"}</code> - High priority jobs</li>
                        <li>• <code>{"{\"company_id\": \"<id>\"}"}</code> - Jobs by company</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">POST</Badge>
                      <code className="text-xs">/entities/Job</code>
                    </div>
                    <p className="text-slate-600 text-xs mb-2">Create new job</p>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-slate-500 mb-1">Required fields:</p>
                      <code className="text-xs">title, company_id</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications API */}
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4 text-green-600" />
                  Applications API
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-xs">/entities/Application</code>
                    </div>
                    <p className="text-slate-600 text-xs">List all applications with candidate-job relationships</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">POST</Badge>
                      <code className="text-xs">/entities/Application</code>
                    </div>
                    <p className="text-slate-600 text-xs mb-2">Create application</p>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-slate-500 mb-1">Required fields:</p>
                      <code className="text-xs">candidate_id, job_id</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">JSON Structure Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Candidate JSON */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Candidate JSON Structure
                </h4>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs">
{`{
  "id": "uuid",                          // Auto-generated
  "created_date": "2024-01-15T10:30:00Z", // Auto-generated
  "updated_date": "2024-01-15T10:30:00Z", // Auto-generated
  "created_by": "user@example.com",      // Auto-generated
  
  "first_name": "John",                  // Required
  "last_name": "Doe",                    // Required
  "email": "john.doe@email.com",         // Required
  "phone": "+1-555-0123",
  "location": "New York, NY",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "resume_url": "https://storage.../resume.pdf",
  
  "skills": ["JavaScript", "React", "Node.js", "AWS"],
  "experience_years": 5,
  "current_title": "Senior Software Engineer",
  "current_company": "Tech Corp",
  "salary_expectation": 120000,
  "availability": "2_weeks",
  "status": "active",
  "work_authorization": "citizen",
  
  "notes": "Strong full-stack developer...",
  "source": "LinkedIn",
  "tags": ["javascript", "senior", "full-stack"],
  
  "bench_match_score": 85,
  "bench_score_details": {
    "technical_skills": 90,
    "experience_level": 85,
    "location_fit": 80
  },
  
  "screening_score": 78,
  "screening_date": "2024-01-14T15:00:00Z",
  "screening_details": {
    "matching_qualifications": ["React", "Node.js"],
    "missing_qualifications": ["Python"],
    "overall_fit": "Strong match"
  }
}`}
                </pre>
              </div>

              {/* Job JSON */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Job JSON Structure
                </h4>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs">
{`{
  "id": "uuid",                          // Auto-generated
  "created_date": "2024-01-15T10:30:00Z", // Auto-generated
  "updated_date": "2024-01-15T10:30:00Z", // Auto-generated
  "created_by": "user@example.com",      // Auto-generated
  
  "title": "Senior Full Stack Developer", // Required
  "company_id": "company-uuid",          // Required (lookup)
  
  "description": "We are seeking a Senior Full Stack Developer...",
  "requirements": "5+ years experience with React and Node.js...",
  
  "location": "New York, NY",
  "remote_type": "hybrid",
  "employment_type": "full_time",
  "rate": "$120,000 - $150,000",
  
  "priority": "high",
  "status": "open",
  
  "required_skills": ["React", "Node.js", "TypeScript", "AWS"],
  "preferred_skills": ["GraphQL", "Docker", "Kubernetes"],
  
  "experience_required": 5,
  "positions_available": 2,
  "hiring_manager": "Jane Smith",
  "due_date": "2024-03-01",
  
  "requester_email": "hiring@company.com",
  "requester_name": "Jane Smith",
  "visa_restrictions": "No H1B sponsorship",
  "location_preference": "Must be in EST timezone",
  "salary_text": "$120K-$150K base + equity",
  "contract_type": "w2"
}`}
                </pre>
              </div>

              {/* Application JSON */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Send className="w-4 h-4 text-green-600" />
                  Application JSON Structure
                </h4>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs">
{`{
  "id": "uuid",                          // Auto-generated
  "created_date": "2024-01-15T10:30:00Z", // Auto-generated
  "updated_date": "2024-01-15T10:30:00Z", // Auto-generated
  "created_by": "user@example.com",      // Auto-generated
  
  "candidate_id": "candidate-uuid",      // Required (lookup)
  "job_id": "job-uuid",                  // Required (lookup)
  
  "status": "interviewing",
  "stage_updated_date": "2024-01-15T10:30:00Z",
  
  "notes": "Strong technical interview...",
  "interview_dates": [
    {
      "date": "2024-01-10T14:00:00Z",
      "type": "phone_screen",
      "interviewer": "John Smith",
      "notes": "Good communication skills",
      "feedback": "Proceed to technical"
    },
    {
      "date": "2024-01-15T10:00:00Z",
      "type": "technical",
      "interviewer": "Jane Doe",
      "notes": "Strong coding skills",
      "feedback": "Recommend hire"
    }
  ],
  
  "submitted_by": "recruiter@company.com",
  "client_feedback": "Excellent candidate, proceeding to final round",
  "rejection_reason": null,
  
  "match_score": 87,
  "score_details": {
    "technical_skills": 92,
    "experience_match": 85,
    "culture_fit": 90,
    "location_compatibility": 80,
    "strengths": ["Strong React skills", "AWS certified"],
    "concerns": ["Limited GraphQL experience"],
    "overall_recommendation": "Strong hire"
  }
}`}
                </pre>
              </div>

              {/* Submission JSON */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Submission JSON Structure
                </h4>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs">
{`{
  "id": "uuid",                          // Auto-generated
  "created_date": "2024-01-15T10:30:00Z", // Auto-generated
  "updated_date": "2024-01-15T10:30:00Z", // Auto-generated
  "created_by": "user@example.com",      // Auto-generated
  
  "candidate_id": "candidate-uuid",      // Required (lookup)
  "job_id": "job-uuid",                  // Required (lookup)
  "recruiter_id": "recruiter-uuid",      // Required
  
  "submitted_date": "2024-01-15T10:30:00Z",
  "status": "under_review",
  
  "client_feedback": "Reviewing resume, will schedule interview",
  "follow_up_date": "2024-01-20",
  "follow_up_completed": false,
  
  "notes": "Submitted via LinkedIn outreach",
  "interview_dates": [],
  
  "client": "Acme Corp",
  "rate": "$85/hr",
  "technologyText": "React, Node.js, AWS"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integration Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">JavaScript/TypeScript (Frontend SDK)</h4>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs">
{`import { base44 } from '@/api/base44Client';

// List candidates
const candidates = await base44.entities.Candidate.list('-created_date', 50);

// Filter candidates by status
const activeCandidates = await base44.entities.Candidate.filter(
  { status: 'active' }, 
  '-updated_date', 
  100
);

// Create candidate
const newCandidate = await base44.entities.Candidate.create({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@email.com',
  skills: ['JavaScript', 'React', 'Node.js'],
  status: 'active'
});

// Update candidate
await base44.entities.Candidate.update(candidateId, {
  status: 'interviewing',
  notes: 'Scheduled for technical interview'
});

// Get candidate by ID
const candidate = await base44.entities.Candidate.get(candidateId);

// Delete candidate
await base44.entities.Candidate.delete(candidateId);`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">cURL Examples</h4>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs">
{`# List candidates
curl -X GET "https://api.base44.com/entities/Candidate?limit=50&sort=-created_date" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"

# Create candidate
curl -X POST "https://api.base44.com/entities/Candidate" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "skills": ["JavaScript", "React"],
    "status": "active"
  }'

# Update candidate
curl -X PUT "https://api.base44.com/entities/Candidate/{id}" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "interviewing",
    "notes": "Scheduled for interview"
  }'`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-base text-amber-900">Rate Limits & Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-2">
              <div>
                <strong>Rate Limits:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>100 requests per minute per user</li>
                  <li>1000 requests per hour per user</li>
                  <li>Bulk operations limited to 100 records per request</li>
                </ul>
              </div>
              <div>
                <strong>Best Practices:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Use filtering and pagination to limit data transfer</li>
                  <li>Cache frequently accessed data (roles, company lists)</li>
                  <li>Use bulk operations for mass updates</li>
                  <li>Implement exponential backoff for retry logic</li>
                  <li>Always validate input data before sending requests</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "ai-agents",
      icon: Brain,
      title: "NEW: AI Agent System",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            The AI Agent system enables intelligent, event-driven automation that can perform complex workflows,
            AI analysis, and multi-step operations without manual intervention.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-base">Agent Triggers</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li><strong>Entity Events:</strong> Triggered on create, update, or delete of specific entities</li>
                <li><strong>Scheduled:</strong> Time-based execution (hourly, daily, weekly, monthly)</li>
                <li><strong>Manual:</strong> User-initiated execution</li>
                <li><strong>Conditional:</strong> With status and field-based conditions</li>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-base">Agent Actions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li><strong>AI Analysis:</strong> Use o1, GPT-4o, Claude 4.5, or GPT-5 for reasoning</li>
                <li><strong>Entity Operations:</strong> Create, update, query, or delete records</li>
                <li><strong>Email Sending:</strong> Send templated or dynamic emails</li>
                <li><strong>Task Creation:</strong> Auto-generate follow-up tasks</li>
                <li><strong>Multi-step Workflows:</strong> Chain multiple actions together</li>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base text-blue-900">Example: Job Matcher Agent</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p><strong>Trigger:</strong> When Job entity is created with status="open"</p>
              <p><strong>Actions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Fetch all active candidates from database</li>
                <li>Use AI (o1 reasoning model) to score each candidate against job requirements</li>
                <li>Store match results in job metadata for instant access</li>
                <li>Auto-create application records for top 10 matches (score ≥ 80)</li>
              </ol>
              <p><strong>Execution:</strong> Runs asynchronously in background with 5-minute timeout</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-base text-green-900">Agent Configuration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800">
              <p className="mb-2">Agents are configured via JSON files in the <code className="bg-white px-2 py-1 rounded">agents/</code> directory with:</p>
              <ul className="space-y-1 ml-4">
                <li>• Name, description, and instructions</li>
                <li>• Trigger configuration (type, entity, conditions)</li>
                <li>• Tool configurations (entity access permissions)</li>
                <li>• Workflow steps with AI prompts and actions</li>
                <li>• Execution settings (async, timeout, enabled state)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-base text-purple-900">Agent Builder UI</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-purple-800">
              <p className="mb-2">Accessible from <strong>Admin Controls → AI Agents</strong>:</p>
              <ul className="space-y-1 ml-4">
                <li>• Visual agent management with performance stats</li>
                <li>• Drag-and-drop action builder</li>
                <li>• AI model selection (o1, GPT-4o, Claude 4.5, GPT-5)</li>
                <li>• Enable/disable agents with one click</li>
                <li>• Performance tracking: runs, successes, failures, avg duration</li>
                <li>• Pre-configured agents: Job Matcher, Follow-up Reminder, Profile Enrichment</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "email-blast",
      icon: MailPlus,
      title: "NEW: Email Blast System",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            The Email Blast system enables recruiters and admins to create targeted email campaigns
            for all company contacts with AI-generated content and flexible export options.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-cyan-500">
              <CardHeader>
                <CardTitle className="text-base">Contact Collection</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Aggregates all contacts from Company entities</li>
                <li>Deduplicates email addresses</li>
                <li>Displays statistics (total companies, contacts, unique emails)</li>
                <li>Allows selective company inclusion/exclusion</li>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-base">AI Content Generation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Generates professional email content from subject line</li>
                <li>Includes company introduction and value propositions</li>
                <li>Adds call-to-action and service highlights</li>
                <li>Professional signature template</li>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-base">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Copy comma-separated list to clipboard</li>
                <li>Export to CSV file</li>
                <li>Open in email client with pre-filled content</li>
                <li>BCC-ready for privacy compliance</li>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-base text-amber-900">Usage Workflow</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800">
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Navigate to <strong>Admin Controls → Email Blast</strong></li>
                <li>Review statistics and select target companies</li>
                <li>Enter email subject line</li>
                <li>Either write message manually or use <strong>AI Generate</strong> button</li>
                <li>Review and customize AI-generated content</li>
                <li>Copy email list (or export to CSV)</li>
                <li>Use <strong>Open in Email Client</strong> or paste into Gmail/Outlook BCC field</li>
                <li>Send campaign</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "advanced-matching",
      icon: Target,
      title: "NEW: Advanced AI Matching",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Advanced AI-powered candidate matching with configurable weighted criteria, multiple reasoning models,
            learning from user feedback, and comprehensive performance tracking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-pink-500">
              <CardHeader>
                <CardTitle className="text-base">Matching Profiles</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li><strong>Weighted Criteria:</strong> Customize weights for 7 dimensions (technical skills, experience, seniority, domain, soft skills, education, location)</li>
                <li><strong>Skill Importance:</strong> Mark skills as "must_have", "preferred", or "nice_to_have"</li>
                <li><strong>Soft Skills Extraction:</strong> AI extracts leadership, communication, collaboration from notes/profiles</li>
                <li><strong>Multiple Strategies:</strong> Balanced, Strict, Lenient, or Learning modes</li>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="text-base">AI Models Available</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li><strong>OpenAI o1:</strong> Reasoning model - best for complex multi-criteria analysis</li>
                <li><strong>Claude 4.5 Opus:</strong> Balanced performance and accuracy</li>
                <li><strong>GPT-5 Preview:</strong> Latest capabilities with advanced understanding</li>
                <li><strong>GPT-4o:</strong> Fast and reliable for standard matching</li>
                <li><strong>Auto-select:</strong> System picks best model for the task</li>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base text-blue-900">Feedback Loop & Learning</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <li><strong>Star Ratings:</strong> 1-5 star feedback on match quality</li>
              <li><strong>Action Tracking:</strong> Viewed, contacted, interviewed, hired, rejected, skipped</li>
              <li><strong>Criteria Accuracy:</strong> Feedback on specific scoring dimensions</li>
              <li><strong>Continuous Learning:</strong> AI adapts weights based on feedback</li>
              <li><strong>Performance Metrics:</strong> Tracks acceptance/rejection rates and accuracy over time</li>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-base text-green-900">Matching Component Features</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800">
              <ul className="space-y-1 ml-4">
                <li>• Multi-dimensional scoring across all weighted criteria</li>
                <li>• Visual progress bars for each criterion (technical skills, experience, etc.)</li>
                <li>• Detailed strengths and concerns breakdown</li>
                <li>• Soft skills identification from candidate profiles</li>
                <li>• AI reasoning display (step-by-step thought process)</li>
                <li>• Match recommendations: Strong match, good match, potential match, poor match</li>
                <li>• Quick actions: Email candidate, view profile, provide feedback</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "ai-quick-actions",
      icon: Zap,
      title: "AI Quick Actions - Detailed Specification",
      content: (
        <div className="space-y-4">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <p className="mb-3">
                AI Quick Actions transforms the traditional quick action button into an intelligent conversational assistant
                that understands natural language and can perform complex operations through simple chat interactions.
              </p>
              <p className="font-semibold">Access: ⌘J / Ctrl+J or floating button (bottom-right)</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-base">Key Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li><strong>Natural Language Understanding:</strong> Processes conversational requests and determines intent</li>
                <li><strong>Context-Aware:</strong> Understands user role and permissions</li>
                <li><strong>Multi-Intent Support:</strong> Navigation, entity creation, information queries, bulk text parsing</li>
                <li><strong>Intelligent Data Extraction:</strong> Extracts contact details, professional info, skills, location from pasted text</li>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-base">Technical Implementation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>LLM Integration using Core.InvokeLLM with structured JSON schema</li>
                <li>Action types: navigate, create_candidate, create_job, create_company, create_task, search</li>
                <li>State management with conversation history for context</li>
                <li>Permissions validation before executing actions</li>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-base text-purple-900">Example Interactions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-purple-800 space-y-3">
              <div>
                <p className="font-semibold">User: "Add a candidate named John Doe"</p>
                <p className="text-xs mt-1">AI: "I'll help you add a new candidate. Opening the Candidates page with the add form..."</p>
                <p className="text-xs text-purple-600">→ Navigates to Candidates page and triggers add form</p>
              </div>
              <div>
                <p className="font-semibold">User: "Manikishore Dasari, Senior Java Developer with 11+ years..."</p>
                <p className="text-xs mt-1">AI: "I've extracted the candidate information! Creating a new candidate record..."</p>
                <p className="text-xs text-purple-600">→ Creates candidate with parsed data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "paste-to-add",
      icon: FileText,
      title: "Paste to Add Candidate - Detailed Specification",
      content: (
        <div className="space-y-4">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <p>
                Paste to Add provides a dedicated interface for quickly adding candidates by pasting resume text,
                LinkedIn profiles, or any candidate information. AI automatically extracts structured data eliminating manual form filling.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-cyan-500">
              <CardHeader>
                <CardTitle className="text-base">Access Points</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li>Candidates Page: "Paste to Add" button in header toolbar (purple gradient)</li>
                <li>AI Quick Actions: Through conversational commands</li>
                <li>Keyboard Shortcut: Available through suggested actions</li>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <CardHeader>
                <CardTitle className="text-base">Data Extraction</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <li><strong>Contact Info:</strong> Name, email, phone using pattern matching</li>
                <li><strong>Professional:</strong> Title, company, years of experience</li>
                <li><strong>Technical Skills:</strong> Languages, frameworks, tools</li>
                <li><strong>Work Auth:</strong> H1B, Green Card, US Citizen detection</li>
                <li><strong>Summary:</strong> Professional bio; original text stored in notes</li>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-base text-amber-900">Example Input & Output</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800">
              <p className="mb-2"><strong>Input:</strong></p>
              <pre className="bg-white rounded p-3 text-xs mb-3 overflow-x-auto">
Manikishore Dasari, Senior Java/J2EE Full Stack Developer with 11+ years...
📧 Email: manidasari104@gmail.com 📞 Phone: 469-722-1749
Skills: Java, Spring Boot, AWS, Angular, ReactJS...
              </pre>
              <p className="mb-2"><strong>Extracted:</strong></p>
              <ul className="space-y-1 ml-4 text-xs">
                <li>• first_name: "Manikishore"</li>
                <li>• last_name: "Dasari"</li>
                <li>• email: "manidasari104@gmail.com"</li>
                <li>• phone: "469-722-1749"</li>
                <li>• current_title: "Senior Java/J2EE Full Stack Developer"</li>
                <li>• experience_years: 11</li>
                <li>• skills: ["Java", "Spring Boot", "AWS", "Angular", "ReactJS"...]</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "profile-resolver",
      icon: Search,
      title: "Profile Resolver & Matching Engine",
      content: (
        <div className="space-y-4">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base">Business Problem & Opportunity</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <p className="mb-2">Data is fragmented across entities; manual cross-referencing is slow and error-prone.</p>
              <p>An intelligent resolver provides instant, actionable insights and a single source of truth.</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base text-blue-900">Functional Requirements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800">
              <ul className="space-y-1 ml-4">
                <li>• FR-001: Unified search bar in main layout</li>
                <li>• FR-002: Parse identifiers (email, LinkedIn, name + company)</li>
                <li>• FR-003: Parallel searches across Candidate, Recruiter, Company</li>
                <li>• FR-004: Aggregate and deduplicate into Master Profiles with source tracking</li>
                <li>• FR-005: Show relationships (applications, submissions, jobs)</li>
                <li>• FR-006: Provide contextual actions (e.g., find similar candidates)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-base text-green-900">Power Engine Logic (Pseudocode)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-white rounded p-3 overflow-x-auto text-green-900">
{`function resolveProfile(query) {
  // 1. Parse & Enrich Query
  const parsedQuery = parseQueryForIdentifiers(query);
  
  // 2. Parallel Internal Searches
  const [candidateResults, recruiterResults, companyResults] = 
    await Promise.all([
      Candidate.search(parsedQuery),
      Recruiter.search(parsedQuery),
      Company.search(parsedQuery.company || parsedQuery.name),
    ]);
  
  // 3. Aggregate & Deduplicate
  const masterProfiles = new Map();
  // ... aggregation logic ...
  
  // 4. Map Relationships
  for (const profile of masterProfiles.values()) {
    const applications = await Application.filter({ 
      candidate_id: cand.id 
    });
    profile.relationships.push({ 
      type: "APPLIED_TO", 
      records: applications 
    });
  }
  
  // 5. Return Profiles
  return Array.from(masterProfiles.values());
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "non-functional",
      icon: Shield,
      title: "4. Non-Functional Requirements",
      content: (
        <div className="space-y-3 text-sm text-slate-700">
          <li>• Responsive UI for desktop and mobile</li>
          <li>• Security via role-based permissions; platform authentication</li>
          <li>• Performance optimizations (throttled loaders, caching of roles, limited AI context windows)</li>
          <li>• Reliability: allow errors to bubble for fast fixes during development</li>
          <li>• Branding: consistent gradient header and background per Layout</li>
          <li>• Email safety: Sends gated by Email Settings (provider connected)</li>
          <li>• UX: ESC closes major modals; consistent focus states and keyboard support</li>
        </div>
      )
    },
    {
      id: "integrations",
      icon: Zap,
      title: "7. Integrations",
      content: (
        <div className="space-y-3 text-sm text-slate-700">
          <li>• <strong>Core.InvokeLLM:</strong> Summaries, Ask AI, resume and bench scoring with strict JSON responses</li>
          <li>• <strong>Core.UploadFile:</strong> Resume/JD uploads</li>
          <li>• <strong>Core.ExtractDataFromUploadedFile:</strong> OCR/text extraction for data import</li>
          <li>• <strong>Core.SendEmail:</strong> Submission emails and email blasts; gated by AppSettings</li>
        </div>
      )
    },
    {
      id: "acceptance",
      icon: CheckCircle,
      title: "8. Acceptance Criteria",
      content: (
        <div className="space-y-3 text-sm text-slate-700">
          <li>• Users can create, edit, delete, and select views; visibility and RLS enforced</li>
          <li>• Bulk scoring uses selected view; supports Draft/Open jobs; skips no-resume; persists scores to Candidate</li>
          <li>• Preview "Edit" navigates to full edit; candidate status editable inline</li>
          <li>• Recruiter role can update Candidates; audit logs capture logins and key actions</li>
          <li>• Dashboard builder (admin) publishes global widgets; non-admins see read-only layout</li>
          <li>• Email features disabled until Gmail/Outlook is marked connected in Email Settings</li>
          <li className="text-purple-700 font-semibold">• NEW: AI candidate-job matching displays top 5 ranked candidates on Job Details page</li>
          <li className="text-purple-700 font-semibold">• NEW: AI agents execute on entity creation/update with background processing</li>
          <li className="text-purple-700 font-semibold">• NEW: Email blast collects all company contacts with deduplication and CSV export</li>
          <li className="text-purple-700 font-semibold">• NEW: Advanced matching uses configurable weights and multiple AI models</li>
        </div>
      )
    },
    {
      id: "future",
      icon: TrendingUp,
      title: "9. Future Enhancements",
      content: (
        <div className="space-y-3 text-sm text-slate-700">
          <li>• Advanced semantic matching models and similarity search</li>
          <li>• Analytics for pipeline conversion and AI score impact</li>
          <li>• Version history for resumes, views, and configurations</li>
          <li className="text-purple-700 font-semibold">• Enhanced interview features - video recording, automated transcription, sentiment analysis</li>
          <li className="text-purple-700 font-semibold">• Predictive analytics - success prediction, time-to-fill forecasting, offer acceptance probability</li>
          <li className="text-purple-700 font-semibold">• Advanced automation - auto-scheduling interviews, smart nurturing campaigns, intelligent task assignment</li>
          <li>• AI-driven follow-up suggestions for submissions and tasks</li>
          <li>• Global search with AI-powered semantic search and fuzzy matching</li>
        </div>
      )
    },
    {
      id: "glossary",
      icon: BookOpen,
      title: "10. Glossary",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div><strong>Match Score:</strong> Weighted alignment between resume and JD</div>
            <div><strong>Fit Score:</strong> AI-calculated 0-100 score for candidate-job compatibility</div>
            <div><strong>Scope (All/Own):</strong> Whether a role acts on all records or only created_by</div>
            <div><strong>LLM:</strong> Large Language Model for summaries and insights</div>
            <div><strong>Live Score Calculator:</strong> Real-time interview scoring as questions are answered</div>
          </div>
          <div className="space-y-2">
            <div><strong>Pipeline Health:</strong> AI-assessed recruitment pipeline state (healthy/at_risk/critical)</div>
            <div><strong>Workload Analysis:</strong> AI evaluation of team work hours and utilization</div>
            <div><strong>AI Quick Actions:</strong> Conversational AI assistant via ⌘J for executing actions</div>
            <div><strong>Paste to Add:</strong> Quick candidate creation from unstructured text</div>
            <div><strong>Matching Profile:</strong> Configurable criteria weights and AI model selection for matching</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Breadcrumbs items={[{ label: "BRD" }]} />
      
      <PageHeader
        title="Business Requirements Document"
        subtitle="Comprehensive system architecture, data model, and feature documentation"
      />

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "overview"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Full Document
        </button>
        <button
          onClick={() => setActiveTab("datamodel")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "datamodel"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Data Model
        </button>
        <button
          onClick={() => setActiveTab("relationships")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "relationships"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <GitBranch className="w-4 h-4 inline mr-2" />
          Relationships
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4">
          {documentSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;
            
            return (
              <Card key={section.id}>
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <CardTitle>{section.title}</CardTitle>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>{section.content}</CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "datamodel" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search entities, fields, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {entityGroups.map((group) => {
            const displayEntities = searchQuery
              ? group.entities.filter(e => filteredEntities.includes(e))
              : group.entities;

            if (displayEntities.length === 0) return null;

            return (
              <div key={group.key} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={`bg-${group.color}-100 text-${group.color}-800`}>
                    {group.label}
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {displayEntities.length} {displayEntities.length === 1 ? 'entity' : 'entities'}
                  </span>
                </div>

                {displayEntities.map((entity) => (
                  <EntityCard
                    key={entity.name}
                    entity={entity}
                    expanded={expandedEntities[entity.name]}
                    onToggle={() => toggleEntity(entity.name)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "relationships" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Entity Relationships</CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Understanding how entities connect to enable comprehensive talent management workflows
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-blue-600" />
                  Core Recruitment Flow
                </h4>
                <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800">Company</Badge>
                    <span className="text-slate-600">→ has many →</span>
                    <Badge className="bg-purple-100 text-purple-800">Jobs</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800">Candidate</Badge>
                    <span className="text-slate-600">→ applies to →</span>
                    <Badge className="bg-purple-100 text-purple-800">Jobs</Badge>
                    <span className="text-slate-600">→ creates →</span>
                    <Badge className="bg-green-100 text-green-800">Application</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-orange-100 text-orange-800">Recruiter</Badge>
                    <span className="text-slate-600">→ submits →</span>
                    <Badge className="bg-blue-100 text-blue-800">Candidate</Badge>
                    <span className="text-slate-600">→ to →</span>
                    <Badge className="bg-purple-100 text-purple-800">Job</Badge>
                    <span className="text-slate-600">→ creates →</span>
                    <Badge className="bg-green-100 text-green-800">Submission</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-600" />
                  AI Matching System
                </h4>
                <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-pink-100 text-pink-800">MatchingProfile</Badge>
                    <span className="text-slate-600">→ defines weights for →</span>
                    <Badge className="bg-blue-100 text-blue-800">Candidate</Badge>
                    <span className="text-slate-600">+</span>
                    <Badge className="bg-purple-100 text-purple-800">Job</Badge>
                    <span className="text-slate-600">matching</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-pink-100 text-pink-800">MatchFeedback</Badge>
                    <span className="text-slate-600">→ trains →</span>
                    <Badge className="bg-pink-100 text-pink-800">MatchingProfile</Badge>
                    <span className="text-slate-600">with user ratings</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Communication & Workflow
                </h4>
                <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800">Candidate</Badge>
                    <span className="text-slate-600">← receives ←</span>
                    <Badge className="bg-cyan-100 text-cyan-800">OutreachMessage</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-green-100 text-green-800">Task</Badge>
                    <span className="text-slate-600">→ can link to →</span>
                    <span className="text-slate-600">[Candidate | Job | Company | Submission]</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-cyan-100 text-cyan-800">InterviewSession</Badge>
                    <span className="text-slate-600">→ connects →</span>
                    <Badge className="bg-blue-100 text-blue-800">Candidate</Badge>
                    <span className="text-slate-600">+</span>
                    <Badge className="bg-purple-100 text-purple-800">Job</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Admin & Security
                </h4>
                <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-orange-100 text-orange-800">User</Badge>
                    <span className="text-slate-600">→ has one →</span>
                    <Badge className="bg-orange-100 text-orange-800">Role</Badge>
                    <span className="text-slate-600">→ defines permissions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <Badge className="bg-cyan-100 text-cyan-800">EmailTemplate</Badge>
                    <span className="text-slate-600">→ used by →</span>
                    <Badge className="bg-green-100 text-green-800">AutomationRule</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Built-in System Fields
              </h4>
              <p className="text-sm text-slate-600 mb-3">
                Every entity automatically includes these system-managed fields:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded p-3">
                  <div className="font-mono text-xs font-semibold mb-1">id</div>
                  <div className="text-xs text-slate-600">Unique identifier (UUID)</div>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <div className="font-mono text-xs font-semibold mb-1">created_date</div>
                  <div className="text-xs text-slate-600">Creation timestamp (ISO 8601)</div>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <div className="font-mono text-xs font-semibold mb-1">updated_date</div>
                  <div className="text-xs text-slate-600">Last update timestamp</div>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <div className="font-mono text-xs font-semibold mb-1">created_by</div>
                  <div className="text-xs text-slate-600">Creator user email</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
