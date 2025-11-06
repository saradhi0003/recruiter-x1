
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  User,
  Briefcase,
  Calendar,
  Send,
  ChevronUp,
  ChevronDown,
  RefreshCcw,
  Settings,
  Save,
  Loader2,
  X,
  Zap,
  CheckSquare,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import SubmissionForm from "@/components/submissions/SubmissionForm";
import KanbanBoard from "@/components/submissions/KanbanBoard";
import ViewSettingsModal from "@/components/submissions/ViewSettingsModal";
import PageHeader from "@/components/common/PageHeader";
import { PermissionsProvider, usePermissions } from "@/components/common/PermissionsContext";
import PermissionGate from "@/components/common/PermissionGate";
import { addNotification } from "@/components/notifications/NotificationToast";
import { executeAutomationRules } from "@/components/automation/executeAutomation";

function SubmissionsPageContent() {
  const { can, isAdmin } = usePermissions();
  const [submissions, setSubmissions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formSubmission, setFormSubmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewType, setViewType] = useState("kanban"); // Default to kanban
  const [sortBy, setSortBy] = useState("submitted_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeView, setActiveView] = useState(null);
  const [views, setViews] = useState([]);

  const [highlightedSubmission, setHighlightedSubmission] = useState(null);
  const [highlightedChanges, setHighlightedChanges] = useState({});
  const [savingHighlighted, setSavingHighlighted] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [visibleColumns, setVisibleColumns] = useState([
    { key: "candidate_id", label: "Candidate", visible: true },
    { key: "job_id", label: "Job", visible: true },
    { key: "status", label: "Status", visible: true },
    { key: "submitted_date", label: "Submitted", visible: true },
  ]);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const [submissionsData, candidatesData, jobsData, companiesData, viewsData] = await Promise.all([
        base44.entities.Submission.list("-submitted_date", 1000),
        base44.entities.Candidate.list("-updated_date", 1000),
        base44.entities.Job.list("-updated_date", 1000),
        base44.entities.Company.list("-updated_date", 500),
        base44.entities.SubmissionView.list().catch(() => [])
      ]);
      
      // Filter submissions to only show past 1 month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const recentSubmissions = (submissionsData || []).filter(submission => {
        if (!submission.submitted_date) return true; // Include if no date
        const submittedDate = new Date(submission.submitted_date);
        return submittedDate >= oneMonthAgo;
      });
      
      setSubmissions(recentSubmissions);
      setCandidates(candidatesData || []);
      setJobs(jobsData || []);
      setCompanies(companiesData || []);
      setViews(viewsData || []);
      
      // Only apply saved view if there's an explicitly marked default view
      // Otherwise, keep the initial kanban default
      if (!activeView && viewsData && viewsData.length > 0) {
        const defaultView = viewsData.find(v => v.is_default);
        if (defaultView) {
          setActiveView(defaultView);
          applyView(defaultView);
        }
        // If no default view is marked, keep initial "kanban" state
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to load applications: " + error.message });
    }
    setLoading(false);
  }, [activeView]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const applyView = (view) => {
    if (!view) return;
    // Reset filters before applying view filters
    setStatusFilter("all"); 
    setSearchTerm("");

    if (view.filters) {
      if (view.filters.status && view.filters.status.length > 0) {
        setStatusFilter(view.filters.status); // Assuming statusFilter can take an array for multi-select
      } else {
        setStatusFilter("all");
      }
    }
    if (view.sort_by) setSortBy(view.sort_by);
    if (view.sort_order) setSortOrder(view.sort_order);
    if (view.visible_columns) {
      setVisibleColumns(view.visible_columns);
    }
    // Always respect the view's view_type if it exists, otherwise default to kanban
    if (view.view_type) {
      setViewType(view.view_type);
    } else {
      setViewType("kanban"); // Fallback to kanban
    }
    setCurrentPage(1); // Reset pagination when view is applied
  };

  const handleHighlightSubmission = (submission) => {
    setHighlightedSubmission(submission);
    setHighlightedChanges({});
    setSelectedSubmission(null);
  };

  const updateHighlightedField = (field, value) => {
    setHighlightedChanges(prev => ({ ...prev, [field]: value }));
  };

  const saveHighlightedChanges = async () => {
    if (!highlightedSubmission || Object.keys(highlightedChanges).length === 0) return;
    
    setSavingHighlighted(true);
    try {
      // Store old data for automation comparison
      const oldData = { ...highlightedSubmission };
      
      await base44.entities.Submission.update(highlightedSubmission.id, highlightedChanges);
      
      // Execute automation rules if status changed
      if (highlightedChanges.status) {
        const newData = { ...highlightedSubmission, ...highlightedChanges };
        executeAutomationRules("Submission", highlightedSubmission.id, oldData, newData).catch(err => {
          console.warn("Automation execution failed:", err);
        });
      }
      
      const candidate = candidates.find(c => c.id === highlightedSubmission.candidate_id);
      const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : "Submission";
      addNotification({ 
        type: "success", 
        title: "Updated", 
        message: `${candidateName} submission updated successfully` 
      });
      setHighlightedSubmission(null);
      setHighlightedChanges({});
      loadSubmissions();
    } catch (error) {
      console.error("Error updating submission:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to update submission" });
    }
    setSavingHighlighted(false);
  };

  const closeHighlightPanel = () => {
    setHighlightedSubmission(null);
    setHighlightedChanges({});
  };

  const statusOptions = [
    { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "under_review", label: "Under Review", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    { value: "interviewing", label: "Interviewing", color: "bg-purple-100 text-purple-800 border-purple-300" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 border-red-300" },
    { value: "hired", label: "Hired", color: "bg-green-100 text-green-800 border-green-300" },
    { value: "withdrawn", label: "Withdrawn", color: "bg-slate-100 text-slate-800 border-slate-300" }
  ];

  const currentStatus = highlightedChanges.status || highlightedSubmission?.status || "submitted";

  const getHighlightedCandidateName = () => {
    if (!highlightedSubmission) return "";
    const candidate = candidates.find(c => c.id === highlightedSubmission.candidate_id);
    if (!candidate) return "Submission";
    return `${candidate.first_name} ${candidate.last_name}`;
  };

  const getHighlightedJobTitle = () => {
    if (!highlightedSubmission) return "";
    const job = jobs.find(j => j.id === highlightedSubmission.job_id);
    return job?.title || "Job";
  };

  const handleDeleteSubmission = async (id) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await base44.entities.Submission.delete(id);
      addNotification({ type: "success", title: "Deleted", message: "Application deleted successfully" });
      loadSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to delete application" });
    }
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredAndSortedSubmissions = submissions.filter(submission => {
    const candidate = candidates.find(c => c.id === submission.candidate_id);
    const job = jobs.find(j => j.id === submission.job_id);
    
    const matchesSearch = !searchTerm || 
      (candidate && `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job && job.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (Array.isArray(statusFilter)) {
      matchesStatus = statusFilter.length === 0 || statusFilter.includes(submission.status);
    } else {
      matchesStatus = submission.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === "candidate_id") {
      const candA = candidates.find(c => c.id === a.candidate_id);
      const candB = candidates.find(c => c.id === b.candidate_id);
      aVal = candA ? `${candA.first_name} ${candA.last_name}` : "";
      bVal = candB ? `${candB.first_name} ${candB.last_name}` : "";
    } else if (sortBy === "job_id") {
      const jobA = jobs.find(j => j.id === a.job_id);
      const jobB = jobs.find(j => j.id === b.job_id); // Changed from c.id to j.id
      aVal = jobA?.title || "";
      bVal = jobB?.title || "";
    }
    
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate pagination for list view
  const totalPages = Math.ceil(filteredAndSortedSubmissions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedSubmissions = filteredAndSortedSubmissions.slice(startIndex, endIndex);

  // Reset to page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [submissions.length, searchTerm, statusFilter, sortBy, sortOrder]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  const toggleSelectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds(new Set(paginatedSubmissions.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const allVisibleSelected = paginatedSubmissions.length > 0 && paginatedSubmissions.every(s => selectedIds.has(s.id));
  const someVisibleSelected = paginatedSubmissions.some(s => selectedIds.has(s.id)) && !allVisibleSelected;

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted": return "bg-blue-100 text-blue-800";
      case "under_review": return "bg-yellow-100 text-yellow-800";
      case "interviewing": return "bg-purple-100 text-purple-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "hired": return "bg-green-100 text-green-800";
      case "withdrawn": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 relative">
      <PageHeader
        title="Applications"
        subtitle={`Track candidate applications and submissions (past 1 month)`}
        right={
          <PermissionGate entity="Submission" action="create">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-white text-blue-700 hover:bg-slate-50" onClick={() => loadSubmissions()}>
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
              <Button onClick={() => { setShowForm(true); setFormSubmission(null); setSelectedSubmission(null); setHighlightedSubmission(null); }} className="gap-2 bg-white text-blue-700 hover:bg-slate-50">
                <Plus className="w-4 h-4" />
                New Application
              </Button>
            </div>
          </PermissionGate>
        }
      />

      {highlightedSubmission && (
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-lg font-semibold">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {getHighlightedCandidateName()}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {getHighlightedJobTitle()}
                    </div>
                    {highlightedSubmission.submitted_date && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(highlightedSubmission.submitted_date).toLocaleDateString()}
                        </div>
                      </>
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
                  setShowForm(true);
                  setFormSubmission(highlightedSubmission);
                  closeHighlightPanel();
                }}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Full Submission
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Applications</p>
                <p className="text-2xl font-bold text-slate-900">{submissions.length}</p>
              </div>
              <Send className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Under Review</p>
                <p className="text-2xl font-bold text-slate-900">
                  {submissions.filter(s => s.status === "under_review").length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Interviewing</p>
                <p className="text-2xl font-bold text-slate-900">
                  {submissions.filter(s => s.status === "interviewing").length}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Hired</p>
                <p className="text-2xl font-bold text-slate-900">
                  {submissions.filter(s => s.status === "hired").length}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("list")}
              >
                List
              </Button>
              <Button
                variant={viewType === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("kanban")}
              >
                Kanban
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setShowViewSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewType === "list" && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {paginatedSubmissions.length === 0 ? 0 : startIndex + 1}-{startIndex + paginatedSubmissions.length} of {filteredAndSortedSubmissions.length} submissions
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
      )}

      {viewType === "kanban" ? (
        <KanbanBoard
          submissions={filteredAndSortedSubmissions}
          candidates={candidates}
          jobs={jobs}
          onSubmissionClick={setSelectedSubmission}
          onRefresh={loadSubmissions}
        />
      ) : viewType === "list" && loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading applications...</p>
        </div>
      ) : viewType === "list" && paginatedSubmissions.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={allVisibleSelected}
                          className={someVisibleSelected ? "data-[state=checked]:bg-primary" : ""}
                          onCheckedChange={(checked) => toggleSelectAllVisible(!!checked)}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs px-2"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Quick Edit
                        </Button>
                      </th>
                      {visibleColumns.filter(c => c.visible).map(col => (
                        <th
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
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedSubmissions.map(submission => {
                      const candidate = candidates.find(c => c.id === submission.candidate_id);
                      const job = jobs.find(j => j.id === submission.job_id);
                      return (
                        <tr
                          key={submission.id}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                            highlightedSubmission?.id === submission.id ? "bg-blue-50" : ""
                          }`}
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(submission.id)}
                              onCheckedChange={() => toggleSelect(submission.id)}
                            />
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleHighlightSubmission(submission)}
                              className="h-8 text-xs"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Quick Edit
                            </Button>
                          </td>
                          {visibleColumns.filter(c => c.visible).map(col => {
                            const value = submission[col.key];
                            return (
                              <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                                {col.key === "candidate_id" && candidate ? (
                                  `${candidate.first_name} ${candidate.last_name}`
                                ) : col.key === "job_id" && job ? (
                                  job.title
                                ) : col.key === "status" ? (
                                  <Badge className={getStatusColor(value)}>
                                    {value?.replace("_", " ")}
                                  </Badge>
                                ) : col.key === "submitted_date" && value ? (
                                  new Date(value).toLocaleDateString()
                                ) : (
                                  value || "—"
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedSubmission(submission)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {can("Submission", "update") && (
                                  <DropdownMenuItem onClick={() => { setFormSubmission(submission); setShowForm(true); }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {can("Submission", "delete") && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteSubmission(submission.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
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
                    
                    if (pageNum < 1 || pageNum > totalPages) return null; // Avoid invalid page numbers
                    
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
      ) : (
        <div className="p-12 text-center">
          <Send className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">No applications found</h3>
          <p className="text-slate-600 mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "No submissions in the past month"}
          </p>
          <PermissionGate entity="Submission" action="create">
            <Button onClick={() => { setShowForm(true); setFormSubmission(null); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Submit New Application
            </Button>
          </PermissionGate>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {formSubmission ? "Edit Application" : "New Application"}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setFormSubmission(null); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <SubmissionForm
                submission={formSubmission}
                candidates={candidates}
                jobs={jobs}
                onSuccess={() => {
                  setShowForm(false);
                  setFormSubmission(null);
                  loadSubmissions();
                }}
                onCancel={() => { setShowForm(false); setFormSubmission(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {showViewSettings && (
        <ViewSettingsModal
          open={showViewSettings}
          onClose={() => setShowViewSettings(false)}
          initial={activeView || { name: "", view_type: "kanban", columns: ["submitted","under_review","interviewing","rejected","hired","withdrawn"], filters: { status: [] }, visibility: "private" }}
          onSave={async (viewData) => {
            try {
              if (viewData.id) {
                await base44.entities.SubmissionView.update(viewData.id, viewData);
              } else {
                await base44.entities.SubmissionView.create(viewData);
              }
              loadSubmissions();
              setShowViewSettings(false);
              addNotification({ type: "success", title: "Saved", message: "View saved successfully" });
            } catch (error) {
              console.error("Error saving view:", error);
              addNotification({ type: "error", title: "Error", message: "Failed to save view" });
            }
          }}
        />
      )}

      {selectedSubmission && (
        <div className="fixed inset-y-0 right-0 z-[100] pointer-events-auto">
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-900">Application Details</h3>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[calc(100%-56px)] overflow-auto p-4">
              {(() => {
                const candidate = candidates.find(c => c.id === selectedSubmission.candidate_id);
                const job = jobs.find(j => j.id === selectedSubmission.job_id);
                return (
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Candidate</p>
                          <p className="font-medium">{candidate ? `${candidate.first_name} ${candidate.last_name}` : "—"}</p>
                          {candidate?.email && <p className="text-sm text-slate-600">{candidate.email}</p>}
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Job</p>
                          <p className="font-medium">{job?.title || "—"}</p>
                          {job?.location && <p className="text-sm text-slate-600">{job.location}</p>}
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Status</p>
                          <Badge className={getStatusColor(selectedSubmission.status)}>
                            {selectedSubmission.status?.replace("_", " ")}
                          </Badge>
                        </div>
                        {selectedSubmission.submitted_date && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Submitted</p>
                            <p className="text-sm">{new Date(selectedSubmission.submitted_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedSubmission.notes && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Notes</p>
                            <p className="text-sm text-slate-700">{selectedSubmission.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setFormSubmission(selectedSubmission);
                          setShowForm(true);
                          setSelectedSubmission(null);
                        }}
                        className="flex-1 gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSubmission(null)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <PermissionsProvider>
      <SubmissionsPageContent />
    </PermissionsProvider>
  );
}
