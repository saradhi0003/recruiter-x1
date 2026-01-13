import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Eye,
  Edit,
  MoreHorizontal,
  MailPlus,
  Upload,
  Trash2,
  Save,
  Loader2,
  X,
  Zap,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job, Company, Recruiter, Candidate } from "@/entities/all";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PermissionGate from "@/components/common/PermissionGate";
import PageHeader from "@/components/common/PageHeader";
import EmailBlastModal from "../components/jobs/EmailBlastModal";
import ImportModal from "@/components/common/ImportModal";
import JobForm from "../components/jobs/JobForm";
import BulkJobPaste from "../components/jobs/BulkJobPaste";
import { usePermissions } from "@/components/common/PermissionsContext";
import { Checkbox } from "@/components/ui/checkbox";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ListViewSettingsModal from "@/components/common/ListViewSettingsModal";
import { JobView } from "@/entities/JobView";
import JobsBulkUpdateModal from "../components/jobs/JobsBulkUpdateModal";
import { addNotification } from "@/components/notifications/NotificationToast";
import { emitEntityChanged } from "@/components/common/refreshBus";
import RecommendedCandidates from "../components/ai/RecommendedCandidates";
import { base44 } from "@/api/base44Client";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recruiters, setRecruiters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showEmailBlast, setShowEmailBlast] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [views, setViews] = useState([]);
  const [selectedViewId, setSelectedViewId] = useState(null);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  const [highlightedJob, setHighlightedJob] = useState(null);
  const [highlightedChanges, setHighlightedChanges] = useState({});
  const [savingHighlighted, setSavingHighlighted] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [viewType, setViewType] = useState("list");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [aiMatchesModalOpen, setAiMatchesModalOpen] = useState(false);
  const [selectedJobForMatches, setSelectedJobForMatches] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const defaultVisibleColumns = [
    { key: "title", label: "Job Title", default: true },
    { key: "company_id", label: "Company", default: true },
    { key: "location", label: "Location", default: true },
    { key: "employment_type", label: "Employment Type", default: true },
    { key: "salary_range", label: "Salary Range", default: true },
    { key: "priority", label: "Priority", default: true },
    { key: "status", label: "Status", default: true },
    { key: "due_date", label: "Due Date", default: true },
  ];
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const jobsGuard = useRef({ ts: 0, inFlight: false });
  const { listFilterFor, me } = usePermissions();

  const loadData = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && jobsGuard.current.inFlight) return;
    if (!force && now - jobsGuard.current.ts < 10000) return;
    jobsGuard.current.inFlight = true;
    setLoading(true);

    try {
      const jobFilter = listFilterFor("Job");
      const companyFilter = listFilterFor("Company");

      const [jobsData, companiesData] = await Promise.all([
        jobFilter ? Job.filter(jobFilter, `-${sortBy}`) : Job.list(`-${sortBy}`),
        companyFilter ? Company.filter(companyFilter) : Company.list()
      ]);
      setJobs(jobsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Error loading jobs:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to load jobs." });
    } finally {
      setLoading(false);
      jobsGuard.current.inFlight = false;
      jobsGuard.current.ts = Date.now();
    }
  }, [listFilterFor, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadViews = async () => {
      try {
        const list = await JobView.list();
        const visibleViews = list.filter(v => {
          if (me?.role === "admin") return true;
          if (v.created_by?.endsWith("admin")) return true;
          if (v.visibility === "team") return true;
          if (me && v.created_by === me.email) return true;
          return false;
        });
        setViews(visibleViews);
        const def = visibleViews.find(v => v.is_default) || visibleViews[0] || null;
        if (def) {
          setSelectedViewId(def.id);
          if (def.sort) {
            const order = def.sort.startsWith('-') ? 'desc' : 'asc';
            const by = def.sort.replace(/^-/, '');
            setSortBy(by);
            setSortOrder(order);
          } else {
            setSortBy("created_date");
            setSortOrder("desc");
          }
          if (def.columns && def.columns.length > 0) {
            setVisibleColumns(def.columns.map(colKey => defaultVisibleColumns.find(col => col.key === colKey) || { key: colKey, label: colKey.replace(/_/g, ' '), default: false }));
          } else {
            setVisibleColumns(defaultVisibleColumns);
          }
          if (def.type) {
            setViewType(def.type);
          } else {
            setViewType("list");
          }
        } else {
          setSelectedViewId(null);
          setSortBy("created_date");
          setSortOrder("desc");
          setVisibleColumns(defaultVisibleColumns);
          setViewType("list");
        }
      } catch (e) {
        console.error("Error loading job views:", e);
        addNotification({ type: "error", title: "Error", message: "Failed to load job views." });
        setViews([]);
        setSelectedViewId(null);
      }
    };
    loadViews();
  }, [me]);

  const sortedJobs = React.useMemo(() => {
    let currentJobs = [...jobs];
    if (sortBy) {
      currentJobs.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'company_id') {
          valA = companies.find(c => c.id === a.company_id)?.name || '';
          valB = companies.find(c => c.id === b.company_id)?.name || '';
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (valA === null || valA === undefined) return sortOrder === 'asc' ? 1 : -1;
        if (valB === null || valB === undefined) return sortOrder === 'asc' ? -1 : 1;
        
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }
    return currentJobs;
  }, [jobs, sortBy, sortOrder, companies]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJobs(sortedJobs);
      return;
    }

    const filtered = sortedJobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompanyName(job.company_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.required_skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredJobs(filtered);
  }, [searchTerm, sortedJobs, companies]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
  };

  const currentView = views.find(v => v.id === selectedViewId) || null;
  const viewStatuses = React.useMemo(() => {
    const s = currentView?.filters?.status;
    return Array.isArray(s) ? s : [];
  }, [currentView]);

  const visibleJobs = React.useMemo(
    () => (filteredJobs || []).filter(j => viewStatuses.length === 0 || viewStatuses.includes(j.status)),
    [filteredJobs, viewStatuses]
  );

  useEffect(() => { setSelectedIds(new Set()); }, [visibleJobs.length, loading]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  
  const toggleSelectAllVisible = (checked) => {
    if (checked) setSelectedIds(new Set(visibleJobs.map(j => j.id)));
    else setSelectedIds(new Set());
  };

  useEffect(() => {
    const loadEmailBlastData = async () => {
      if (!showEmailBlast) return;
      try {
        if (recruiters.length === 0) {
          const recs = await Recruiter.list();
          setRecruiters(recs || []);
        }
        if (candidates.length === 0) {
          const cands = await Candidate.list("-updated_date", 200);
          setCandidates(cands || []);
        }
      } catch (e) {
        console.error("Error loading email blast data:", e);
        addNotification({ type: "error", title: "Error", message: "Failed to load recruiter/candidate data." });
      }
    };
    loadEmailBlastData();
  }, [showEmailBlast, recruiters.length, candidates.length]);

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await Job.delete(jobToDelete.id);
      setShowDelete(false);
      setJobToDelete(null);
      loadData(true);
      addNotification({ type: "success", title: "Deleted", message: `${jobToDelete.title} deleted successfully.` });
      emitEntityChanged("Job");
    } catch (e) {
      console.error("Failed to delete job:", e);
      addNotification({ type: "error", title: "Error", message: "Failed to delete job." });
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await Promise.all(ids.map(id => Job.delete(id)));
      setShowBulkDelete(false);
      setSelectedIds(new Set());
      loadData(true);
      addNotification({ type: "success", title: "Deleted", message: `${ids.length} job(s) deleted successfully.` });
      emitEntityChanged("Job");
    } catch (e) {
      console.error("Failed to bulk delete jobs:", e);
      addNotification({ type: "error", title: "Error", message: "Failed to bulk delete jobs." });
    }
  };

  const saveJob = async (payload) => {
    try {
      let savedJob;
      if (editingJob) {
        savedJob = await Job.update(editingJob.id, payload);
        addNotification({ type: "success", title: "Updated", message: `${savedJob.title} updated successfully.` });
      } else {
        savedJob = await Job.create(payload);
        addNotification({ type: "success", title: "Created", message: `${savedJob.title} created successfully.` });
      }
      
      if (savedJob.status === 'open') {
        try {
          const syncResult = await base44.functions.invoke('syncJobToCareers', { 
            job_id: savedJob.id 
          });
          
          if (syncResult.data?.success) {
            addNotification({ 
              type: "success", 
              title: "Published to Careers", 
              message: `${savedJob.title} is now visible on talentstack.org/careers` 
            });
          }
        } catch (syncError) {
          console.error("Failed to sync to careers page:", syncError);
          console.warn("Job saved but careers sync failed - can be retried manually");
        }
      }
      
      setShowJobForm(false);
      setEditingJob(null);
      loadData(true);
      emitEntityChanged("Job");
      return savedJob;
    } catch (error) {
      console.error("Error saving job:", error);
      addNotification({ type: "error", title: "Error", message: `Failed to save job: ${error.message}.` });
      throw error;
    }
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || "Unknown Company";
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      open: "bg-green-100 text-green-800",
      on_hold: "bg-yellow-100 text-yellow-800",
      filled: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.draft;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || colors.medium;
  };

  const saveView = async (payload) => {
    try {
      let saved;
      if (payload.id) {
        saved = await JobView.update(payload.id, payload);
        setViews(prev => {
            const updatedViews = prev.map(v => v.id === saved.id ? saved : v);
            if (saved.is_default && selectedViewId !== saved.id) {
                setSelectedViewId(saved.id);
            }
            return updatedViews;
        });
        addNotification({ type: "success", title: "Updated", message: `View '${saved.name}' updated successfully.` });
      } else {
        saved = await JobView.create(payload);
        setViews(prev => [saved, ...prev]);
        setSelectedViewId(saved.id);
        addNotification({ type: "success", title: "Created", message: `View '${saved.name}' created successfully.` });
      }
      setShowViewSettings(false);
      if (saved.id === selectedViewId || !selectedViewId) {
        if (saved.sort) {
          const order = saved.sort.startsWith('-') ? 'desc' : 'asc';
          const by = saved.sort.replace(/^-/, '');
          setSortBy(by);
          setSortOrder(order);
        } else {
          setSortBy("created_date");
          setSortOrder("desc");
        }
        if (saved.columns && saved.columns.length > 0) {
          setVisibleColumns(saved.columns.map(colKey => defaultVisibleColumns.find(col => col.key === colKey) || { key: colKey, label: colKey.replace(/_/g, ' '), default: false }));
        } else {
          setVisibleColumns(defaultVisibleColumns);
        }
        if (saved.type) {
          setViewType(saved.type);
        } else {
          setViewType("list");
        }
      }
    } catch (e) {
      console.error("Error saving job view:", e);
      addNotification({ type: "error", title: "Error", message: "Failed to save job view." });
    }
  };

  const jobStatusOptions = [
    { value: "draft", label: "Draft" },
    { value: "open", label: "Open" },
    { value: "on_hold", label: "On Hold" },
    { value: "filled", label: "Filled" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const handleHighlightJob = (job) => {
    setHighlightedJob(job);
    setHighlightedChanges({});
    setSelectedJob(null);
  };

  const updateHighlightedField = (field, value) => {
    setHighlightedChanges(prev => ({ ...prev, [field]: value }));
  };

  const saveHighlightedChanges = async () => {
    if (!highlightedJob || Object.keys(highlightedChanges).length === 0) return;
    
    setSavingHighlighted(true);
    try {
      await Job.update(highlightedJob.id, highlightedChanges);
      addNotification({ 
        type: "success", 
        title: "Updated", 
        message: `${highlightedJob.title} updated successfully` 
      });
      setHighlightedJob(null);
      setHighlightedChanges({});
      loadData(true);
      emitEntityChanged("Job");
    } catch (error) {
      console.error("Error updating job:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to update job" });
    }
    setSavingHighlighted(false);
  };

  const closeHighlightPanel = () => {
    setHighlightedJob(null);
    setHighlightedChanges({});
  };

  const statusOptions = [
    { value: "draft", label: "Draft", color: "bg-slate-100 text-slate-800 border-slate-300" },
    { value: "open", label: "Open", color: "bg-green-100 text-green-800 border-green-300" },
    { value: "on_hold", label: "On Hold", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    { value: "filled", label: "Filled", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-300" }
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-slate-100 text-slate-800 border-slate-300" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800 border-orange-300" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800 border-red-300" }
  ];

  const currentStatus = highlightedChanges.status || highlightedJob?.status || "open";
  const currentPriority = highlightedChanges.priority || highlightedJob?.priority || "medium";

  const openAIMatchesModal = (job) => {
    setSelectedJobForMatches(job);
    setAiMatchesModalOpen(true);
  };

  const closeAIMatchesModal = () => {
    setAiMatchesModalOpen(false);
    setSelectedJobForMatches(null);
  };

  const totalPages = Math.ceil(visibleJobs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedJobs = visibleJobs.slice(startIndex, endIndex);

  const allVisibleSelected = paginatedJobs.length > 0 && paginatedJobs.every(j => selectedIds.has(j.id));
  const someVisibleSelected = paginatedJobs.some(j => selectedIds.has(j.id)) && !allVisibleSelected;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, selectedViewId, visibleJobs.length]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 relative">
      <PageHeader
        title="Jobs"
        subtitle="Manage open positions and job postings"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 whitespace-nowrap" onClick={() => setShowEmailBlast(true)}>
              <MailPlus className="w-4 h-4" />
              Email Blast
            </Button>
            <Button variant="outline" className="gap-2 whitespace-nowrap" onClick={() => setShowImport(true)}>
              <Upload className="w-4 h-4" />
              Import CSV
            </Button>
            <Button variant="outline" className="gap-2 whitespace-nowrap" onClick={() => setShowBulkPaste(true)}>
              <FileText className="w-4 h-4" />
              Paste Requirement
            </Button>
            <PermissionGate entity="Job" action="create">
              <Button variant="outline" className="gap-2 bg-white text-blue-700 hover:bg-slate-50" onClick={() => loadData(true)}>
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
              <Button onClick={() => { setEditingJob(null); setShowJobForm(true); setSelectedJob(null); setHighlightedJob(null); }} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4" />
                Add Job
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {highlightedJob && (
        <Card className="border-2 border-blue-500 shadow-lg sticky top-0 z-10 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-lg font-semibold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {highlightedJob.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    {highlightedJob.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {highlightedJob.location}
                      </div>
                    )}
                    {highlightedJob.employment_type && (
                      <span>• {highlightedJob.employment_type.replace("_", " ")}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeHighlightPanel}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Quick Status Update
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateHighlightedField("status", option.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                      currentStatus === option.value
                        ? option.color + " shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Quick Priority Update
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateHighlightedField("priority", option.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                      currentPriority === option.value
                        ? option.color + " shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={saveHighlightedChanges}
                disabled={savingHighlighted || Object.keys(highlightedChanges).length === 0}
                className="gap-2"
              >
                {savingHighlighted ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowJobForm(true);
                  setEditingJob(highlightedJob);
                  closeHighlightPanel();
                }}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Full Job
              </Button>
              {Object.keys(highlightedChanges).length > 0 && (
                <Badge className="ml-auto bg-orange-100 text-orange-800">
                  {Object.keys(highlightedChanges).length} unsaved change{Object.keys(highlightedChanges).length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search jobs by title, location, company or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2 whitespace-nowrap" onClick={() => setShowViewSettings(true)}>
              <Filter className="w-4 h-4" />
              Filters & Display
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-3 py-2 text-sm bg-white text-slate-700"
            value={selectedViewId || ""}
            onChange={(e) => {
              const newViewId = e.target.value || null;
              setSelectedViewId(newViewId);
              const view = views.find(v => v.id === newViewId);
              if (view) {
                if (view.sort) {
                  const order = view.sort.startsWith('-') ? 'desc' : 'asc';
                  const by = view.sort.replace(/^-/, '');
                  setSortBy(by);
                  setSortOrder(order);
                } else {
                  setSortBy("created_date");
                  setSortOrder("desc");
                }
                if (view.columns && view.columns.length > 0) {
                  setVisibleColumns(view.columns.map(colKey => defaultVisibleColumns.find(col => col.key === colKey) || { key: colKey, label: colKey.replace(/_/g, ' '), default: false }));
                } else {
                  setVisibleColumns(defaultVisibleColumns);
                }
                if (view.type) {
                  setViewType(view.type);
                } else {
                  setViewType("list");
                }
              } else {
                setSortBy("created_date");
                setSortOrder("desc");
                setVisibleColumns(defaultVisibleColumns);
                setViewType("list");
              }
              setCurrentPage(1);
            }}
          >
            <option value="">All Jobs (Default)</option>
            {views.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <Button variant="outline" className="gap-2" onClick={() => setShowViewSettings(true)} disabled={!selectedViewId}>
            Edit View
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setSelectedViewId(null); setShowViewSettings(true); }}>
            New View
          </Button>
        </div>
        <div className="text-sm text-slate-600">
          {currentView ? `Filters: ${viewStatuses.length ? viewStatuses.map(s => s.replace(/_/g, ' ')).join(", ") : "None"}` : "Default filters"}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {paginatedJobs.length === 0 ? 0 : startIndex + 1}-{startIndex + paginatedJobs.length} of {visibleJobs.length} jobs
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => handleRowsPerPageChange(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
          </select>
        </div>
      </div>

      {viewType === "list" ? (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading jobs...</p>
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-600 mb-4">
                  {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first job"}
                </p>
                <PermissionGate entity="Job" action="create">
                  <Button onClick={() => { setEditingJob(null); setShowJobForm(true); }} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add First Job
                  </Button>
                </PermissionGate>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                  <div className="text-sm text-slate-700">
                    {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select rows for bulk actions"}
                  </div>
                  <div className="flex gap-2">
                    <PermissionGate entity="Job" action="update">
                      <Button
                        variant="outline"
                        className="gap-2"
                        disabled={selectedIds.size === 0}
                        onClick={() => setShowBulkUpdate(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Update Selected
                      </Button>
                    </PermissionGate>
                    <PermissionGate entity="Job" action="delete">
                      <Button
                        variant="destructive"
                        className="gap-2"
                        disabled={selectedIds.size === 0}
                        onClick={() => setShowBulkDelete(true)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                      </Button>
                    </PermissionGate>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={allVisibleSelected}
                            className={someVisibleSelected ? "data-[state=checked]:bg-primary" : ""}
                            onCheckedChange={(checked) => toggleSelectAllVisible(!!checked)}
                          />
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Quick Edit
                        </TableHead>
                        {visibleColumns.map(col => (
                          <TableHead
                            key={col.key}
                            className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100"
                            onClick={() => handleSort(col.key)}
                          >
                            <div className="flex items-center gap-1">
                              {col.label}
                              {sortBy === col.key && (
                                sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          AI Matches
                        </TableHead>
                        <TableHead className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedJobs.map((job) => (
                        <TableRow
                          key={job.id}
                          className={`hover:bg-slate-50 ${highlightedJob?.id === job.id ? "bg-blue-50" : ""}`}
                          onClick={() => setSelectedJob(job)}
                        >
                          <TableCell className="w-10">
                            <Checkbox
                              checked={selectedIds.has(job.id)}
                              onCheckedChange={() => toggleSelect(job.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleHighlightJob(job)}
                              className="h-8 text-xs"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Quick Edit
                            </Button>
                          </TableCell>
                          {visibleColumns.map(col => (
                            <TableCell key={col.key}>
                              {col.key === "title" && (
                                <div>
                                  <Link
                                    to={createPageUrl(`JobDetails?id=${job.id}`)}
                                    className="font-medium text-blue-600 hover:underline"
                                    title="Open job"
                                  >
                                    {job.title}
                                  </Link>
                                  <p className="text-sm text-slate-500">
                                    Posted {new Date(job.created_date).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {col.key === "company_id" && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  {getCompanyName(job.company_id)}
                                </div>
                              )}
                              {col.key === "location" && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {job.location || "Not specified"}
                                </div>
                              )}
                              {col.key === "employment_type" && (
                                <Badge variant="outline">
                                  {job.employment_type?.replace('_', ' ')}
                                </Badge>
                              )}
                              {col.key === "salary_range" && (
                                job.salary_min && job.salary_max ? (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-slate-400" />
                                    ${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()}
                                  </div>
                                ) : (
                                  "Not specified"
                                )
                              )}
                              {col.key === "priority" && (
                                <Badge className={getPriorityColor(job.priority)}>
                                  {job.priority}
                                </Badge>
                              )}
                              {col.key === "status" && (
                                <Badge className={getStatusColor(job.status)}>
                                  {job.status?.replace('_', ' ')}
                                </Badge>
                              )}
                              {col.key === "due_date" && (
                                job.due_date ? (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {new Date(job.due_date).toLocaleDateString()}
                                  </div>
                                ) : (
                                  "No due date"
                                )
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAIMatchesModal(job)}
                              className="gap-2"
                            >
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              View Matches
                            </Button>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={createPageUrl(`JobDetails?id=${job.id}`)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditingJob(job); setShowJobForm(true); }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Job
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={createPageUrl(`JobDetails?id=${job.id}`)}>
                                    <Users className="w-4 h-4 mr-2" />
                                    View Applications
                                  </Link>
                                </DropdownMenuItem>
                                <PermissionGate entity="Job" action="delete">
                                  <DropdownMenuItem
                                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                    onClick={() => { setJobToDelete(job); setShowDelete(true); }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Job
                                  </DropdownMenuItem>
                                </PermissionGate>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-4 pb-4">
                    <p className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="gap-1"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="gap-1"
                      >
                        Last
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : viewType === "kanban" ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            Kanban view coming soon!
          </CardContent>
        </Card>
      ) : null}

      {showEmailBlast && (
        <EmailBlastModal
          open={showEmailBlast}
          onClose={() => setShowEmailBlast(false)}
          jobs={jobs}
          recruiters={recruiters}
          candidates={candidates}
        />
      )}

      {showJobForm && (
        <JobForm
          job={editingJob}
          onSave={saveJob}
          onCancel={() => { setShowJobForm(false); setEditingJob(null); }}
        />
      )}

      {showImport && (
        <ImportModal
          open={showImport}
          onClose={() => setShowImport(false)}
          entityName="Jobs"
          entitySdk={Job}
          onImported={() => { setShowImport(false); loadData(true); }}
        />
      )}

      {showBulkPaste && (
        <BulkJobPaste
          open={showBulkPaste}
          onClose={() => setShowBulkPaste(false)}
          onSuccess={() => {
            setShowBulkPaste(false);
            loadData(true);
          }}
          companies={companies}
        />
      )}

      {showDelete && jobToDelete && (
        <DeleteConfirmModal
          open={showDelete}
          title="Delete Job"
          message={`Are you sure you want to delete "${jobToDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete Job"
          onConfirm={handleDeleteJob}
          onCancel={() => { setShowDelete(false); setJobToDelete(null); }}
        />
      )}

      {showBulkDelete && selectedIds.size > 0 && (
        <DeleteConfirmModal
          open={showBulkDelete}
          title="Delete Selected Jobs"
          message={`Are you sure you want to delete ${selectedIds.size} selected job(s)? This action cannot be undone.`}
          confirmLabel="Delete Jobs"
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDelete(false)}
        />
      )}

      <ListViewSettingsModal
        open={showViewSettings}
        onClose={() => setShowViewSettings(false)}
        initial={currentView || { name: "", filters: { status: [] }, visibility: "private", sort: "-created_date", type: "list", columns: defaultVisibleColumns.map(c => c.key) }}
        statusOptions={jobStatusOptions}
        columnOptions={defaultVisibleColumns}
        onSave={saveView}
      />

      {showBulkUpdate && (
        <JobsBulkUpdateModal
          open={showBulkUpdate}
          onClose={() => setShowBulkUpdate(false)}
          selectedIds={selectedIds}
          onComplete={() => {
            setShowBulkUpdate(false);
            setSelectedIds(new Set());
            loadData(true);
          }}
        />
      )}

      {aiMatchesModalOpen && selectedJobForMatches && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI Recommended Candidates</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  For: {selectedJobForMatches.title}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeAIMatchesModal}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-6">
              <RecommendedCandidates job={selectedJobForMatches} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}