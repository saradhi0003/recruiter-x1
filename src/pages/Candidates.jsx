
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Eye,
  Edit,
  Upload,
  Users,
  MoreHorizontal,
  Trash,
  RefreshCcw,
  X,
  Loader2,
  Save,
  Zap,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Trash2,
  ChevronsLeft, // Added for pagination
  ChevronsRight, // Added for pagination
  ChevronLeft, // Added for pagination
  ChevronRight // Added for pagination
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import CandidateForm from "../components/candidates/CandidateForm";
import CandidateDetails from "../components/candidates/CandidateDetails";
import PermissionGate from "@/components/common/PermissionGate";
import PageHeader from "@/components/common/PageHeader";
import ImportModal from "@/components/common/ImportModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import CandidatesBulkUpdateModal from "@/components/candidates/CandidatesBulkUpdateModal";
import { usePermissions } from "@/components/common/PermissionsContext";
import ListViewSettingsModal from "@/components/common/ListViewSettingsModal";
import RightPreviewPanel from "@/components/common/RightPreviewPanel";
import CandidatePreview from "@/components/candidates/CandidatePreview";
import BulkBenchScorer from "@/components/ai/BulkBenchScorer";
import { emitEntityChanged, useEntityAutoRefresh } from "@/components/common/refreshBus";
import { addNotification } from "@/components/notifications/NotificationToast";
import { SkeletonTable } from "@/components/common/SkeletonLoader";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import BulkResumeUpload from "@/components/candidates/BulkResumeUpload";
import PasteToAddCandidate from "../components/candidates/PasteToAddCandidate";

const EmailModal = ({ open, onClose, recipient }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Send Email to {recipient?.first_name} {recipient?.last_name}</h3>
        <p>This is a placeholder for the email modal.</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = new useState(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  const [views, setViews] = useState([]);
  const [selectedViewId, setSelectedViewId] = useState(null);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [showDeleteViewConfirm, setShowDeleteViewConfirm] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showBenchScorer, setShowBenchScorer] = useState(false);
  const [showBulkResumeUpload, setShowBulkResumeUpload] = useState(false);
  const [showPasteToAdd, setShowPasteToAdd] = useState(false);

  const [highlightedCandidate, setHighlightedCandidate] = useState(null);
  const [highlightedChanges, setHighlightedChanges] = useState({});
  const [savingHighlighted, setSavingHighlighted] = useState(false);

  const [viewType, setViewType] = useState("list");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { listFilterFor, me, role, isAdmin, can } = usePermissions();

  const loadGuard = useRef({ ts: 0, inFlight: false });

  useEntityAutoRefresh("Candidate", () => loadCandidates(true));

  const filterCandidates = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredCandidates(candidates);
      return;
    }
    const filtered = candidates.filter(candidate =>
      `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.current_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  const loadCandidates = useCallback(async (force = false) => {
    const now = Date.now();
    if (loadGuard.current.inFlight) {
      return;
    }
    if (!force && now - loadGuard.current.ts < 30000) {
      return;
    }

    loadGuard.current.inFlight = true;
    setLoading(true);

    const cacheKey = `candidates_cache_${me?.email || "anon"}`;
    const serveFromCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.ts && now - parsed.ts < 60 * 1000 && Array.isArray(parsed.data)) {
            setCandidates(parsed.data);
            setFilteredCandidates(parsed.data);
            return true;
          }
        }
      } catch (e) {
        console.error("Error parsing candidates cache:", e);
      }
      return false;
    };

    try {
      const filter = listFilterFor("Candidate");
      // CHANGED: Increased limit to 500 to show all candidates
      const data = filter
        ? await base44.entities.Candidate.filter(filter, "-created_date", 500)
        : await base44.entities.Candidate.list("-created_date", 500);
      
      console.log(`✅ Loaded ${data.length} candidates from database`);
      
      setCandidates(data);
      setFilteredCandidates(data);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
      } catch (e) {
        console.error("Error writing candidates to cache:", e);
      }
    } catch (error) {
      console.warn("Error loading candidates from API:", error?.message || error);
      if (!serveFromCache()) {
        setCandidates([]);
        setFilteredCandidates([]);
      }
    } finally {
      setLoading(false);
      loadGuard.current.inFlight = false;
      loadGuard.current.ts = Date.now();
    }
  }, [listFilterFor, me?.email]);

  const handleHighlightCandidate = (candidate) => {
    setHighlightedCandidate(candidate);
    setHighlightedChanges({});
    setSelectedCandidate(null);
  };

  const updateHighlightedField = (field, value) => {
    setHighlightedChanges(prev => ({ ...prev, [field]: value }));
  };

  const saveHighlightedChanges = async () => {
    if (!highlightedCandidate || Object.keys(highlightedChanges).length === 0) return;

    setSavingHighlighted(true);
    try {
      await base44.entities.Candidate.update(highlightedCandidate.id, highlightedChanges);
      addNotification({
        type: "success",
        title: "Updated",
        message: `${highlightedCandidate.first_name} ${highlightedCandidate.last_name} updated successfully`
      });
      setHighlightedCandidate(null);
      setHighlightedChanges({});
      loadCandidates(true);
      emitEntityChanged("Candidate");
    } catch (error) {
      console.error("Error updating candidate:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to update candidate" });
    }
    setSavingHighlighted(false);
  };

  const closeHighlightPanel = () => {
    setHighlightedCandidate(null);
    setHighlightedChanges({});
  };

  useEffect(() => {
    const loadViews = async () => {
      try {
        const list = await base44.entities.CandidateView.list();
        const myRoleName = (me?.role || "").toLowerCase();
        const myAccessName = (role?.name || "").toLowerCase();

        const visibleViews = list.filter(v => {
          if (me?.role === "admin") return true;
          if (v.created_by === me?.email) return true;
          if (v.visibility === "team" || v.visibility === "public") return true;
          if (v.visibility === "role_admin" && myRoleName === "admin") return true;
          if (v.visibility === "role_user" && myRoleName === "user") return true;
          if (v.visibility === "role_recruiter" && myAccessName === "recruiter") return true;
          return false;
        });
        setViews(visibleViews);
        const def = visibleViews.find(v => v.is_default) || visibleViews[0] || null;
        if (def) setSelectedViewId(def.id);
      } catch (e) {
        console.error("Error loading candidate views:", e);
        setViews([]);
        setSelectedViewId(null);
      }
    };
    loadViews();
  }, [me, role]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const allVisibleSelected = filteredCandidates.length > 0 && filteredCandidates.every(c => selectedIds.has(c.id));
  const someVisibleSelected = filteredCandidates.some(c => selectedIds.has(c.id)) && !allVisibleSelected;
  const toggleSelectAllVisible = (checked) => {
    if (checked) setSelectedIds(new Set(filteredCandidates.map(c => c.id)));
    else setSelectedIds(new Set());
  };

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    filterCandidates();
  }, [filterCandidates]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filteredCandidates.length, loading]);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedViewId, sortBy, sortOrder, filteredCandidates.length]);


  const handleAddCandidate = async (candidateData) => {
    try {
      if (editingCandidate) {
        await base44.entities.Candidate.update(editingCandidate.id, candidateData);
        try { localStorage.setItem("candidate_cache_bust", String(Date.now())); } catch (_) {}
        window.dispatchEvent(new Event("candidate_cache_bust"));
        window.dispatchEvent(new CustomEvent("entity:Candidate:changed"));
        setEditingCandidate(null);
        setShowForm(false);
        loadCandidates(true);
        emitEntityChanged("Candidate");
        return;
      }
      await base44.entities.Candidate.create(candidateData);
      try { localStorage.setItem("candidate_cache_bust", String(Date.now())); } catch (_) {}
      window.dispatchEvent(new Event("candidate_cache_bust"));
      window.dispatchEvent(new CustomEvent("entity:Candidate:changed"));
      setShowForm(false);
      loadCandidates(true);
      emitEntityChanged("Candidate");
    } catch (error) {
      console.error("Error adding/updating candidate:", error);
    }
  };

  const handleEdit = (candidate) => {
    setSelectedCandidate(null);
    setHighlightedCandidate(null);
    setEditingCandidate(candidate);
    setShowForm(true);
  };

  const handleDeleteCandidate = async (candidateId) => {
    const candidateToDel = candidates.find(c => c.id === candidateId);
    if (!candidateToDel) return;
    setCandidateToDelete(candidateToDel);
    setShowDelete(true);
  };

  const deleteCandidate = async () => {
    if (!candidateToDelete) return;
    try {
      await base44.entities.Candidate.delete(candidateToDelete.id);
      addNotification({ type: "success", title: "Deleted", message: `${candidateToDelete.first_name} ${candidateToDelete.last_name} deleted.` });
      setShowDelete(false);
      setCandidateToDelete(null);
      loadCandidates(true);
      emitEntityChanged("Candidate");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      addNotification({ type: "error", title: "Error", message: `Failed to delete ${candidateToDelete.first_name} ${candidateToDelete.last_name}.` });
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await Promise.all(ids.map(id => base44.entities.Candidate.delete(id)));
      addNotification({ type: "success", title: "Deleted", message: `${ids.length} candidates deleted.` });
      setShowBulkDelete(false);
      setSelectedIds(new Set());
      loadCandidates(true);
      emitEntityChanged("Candidate");
    } catch (error) {
      console.error("Error bulk deleting candidates:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to delete selected candidates." });
    }
  };

  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800 border-green-300" },
    { value: "our_bench", label: "Our Bench", color: "bg-purple-100 text-purple-800 border-purple-300" },
    { value: "screened", label: "Screened", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "placed", label: "Placed", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800 border-gray-300" },
    { value: "do_not_contact", label: "Do Not Contact", color: "bg-red-100 text-red-800 border-red-300" }
  ];

  const getCandidateStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800 border-gray-300";
  };

  const currentView = views.find(v => v.id === selectedViewId) || null;
  const canDeleteCurrentView = !!currentView && (isAdmin || currentView.created_by === me?.email);
  const viewStatuses = Array.isArray(currentView?.filters?.status) ? currentView.filters.status : [];
  
  let filteredCandidatesWithView = filteredCandidates.filter(c =>
    viewStatuses.length === 0 || viewStatuses.includes(c.status)
  );

  const defaultColumns = [
    { key: "first_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "current_title", label: "Current Role" },
    { key: "current_company", label: "Company" },
    { key: "experience_years", label: "Experience" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "bench_match_score", label: "Score" },
    { key: "skills", label: "Skills" },
    { key: "created_date", label: "Added Date" },
  ];

  const [visibleColumns, setVisibleColumns] = useState(defaultColumns.map(col => col.key));

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const filteredAndSorted = [...filteredCandidatesWithView].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
    if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? -1 : 1;
    return 0;
  });

  const saveView = async (payload) => {
    try {
      let savedView;
      if (payload.id) {
        savedView = await base44.entities.CandidateView.update(payload.id, payload);
        setViews(prevViews => prevViews.map(v => (v.id === savedView.id ? savedView : v)));
      } else {
        savedView = await base44.entities.CandidateView.create(payload);
        setViews(prevViews => [savedView, ...prevViews]);
        setSelectedViewId(savedView.id);
      }
      addNotification({ type: "success", title: "View Saved", message: `View "${savedView.name}" saved successfully.` });
      setShowViewSettings(false);
    } catch (e) {
      console.error("Error saving candidate view:", e);
      addNotification({ type: "error", title: "Error", message: "Failed to save view." });
    }
  };

  const handleDeleteView = async () => {
    if (!currentView) return;
    try {
      await base44.entities.CandidateView.delete(currentView.id);
      setViews(prev => prev.filter(v => v.id !== currentView.id));
      setSelectedViewId(null);
      addNotification({ type: "success", title: "View Deleted", message: `View "${currentView.name}" deleted.` });
      setShowDeleteViewConfirm(false);
    } catch (e) {
      console.error("Error deleting candidate view:", e);
      addNotification({ type: "error", title: "Error", message: "Failed to delete view." });
    }
  };

  const currentHighlightStatus = highlightedChanges.status || highlightedCandidate?.status || "active";

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSorted.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCandidates = filteredAndSorted.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };


  return (
    <div className="p-6 lg:p-8 space-y-6 relative">
      <Breadcrumbs items={[{ label: "Candidates", icon: Users }]} />
      
      <PageHeader
        title="Candidates"
        subtitle="Manage your talent pool"
        right={
          <PermissionGate entity="Candidate" action="create">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-white text-blue-700 hover:bg-slate-50" onClick={() => loadCandidates(true)}>
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
              <Button onClick={() => { setShowForm(true); setEditingCandidate(null); setSelectedCandidate(null); setHighlightedCandidate(null); }} className="gap-2 bg-white text-blue-700 hover:bg-slate-50">
                <Plus className="w-4 h-4" />
                Add Candidate
              </Button>
              <Button variant="outline" className="gap-2 whitespace-nowrap bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200" onClick={() => setShowPasteToAdd(true)}>
                <Zap className="w-4 h-4 text-purple-600" />
                Paste to Add
              </Button>
              <Button variant="outline" className="gap-2 whitespace-nowrap" onClick={() => setShowBulkResumeUpload(true)}>
                <Upload className="w-4 h-4" />
                Bulk Upload
              </Button>
              <Button variant="outline" className="gap-2 whitespace-nowrap" onClick={() => setShowImport(true)}>
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
              <Button variant="secondary" className="gap-2" onClick={() => setShowBenchScorer(true)}>
                <Briefcase className="w-4 h-4" />
                Bulk Scoring
              </Button>
            </div>
          </PermissionGate>
        }
      />

      {highlightedCandidate && (
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-lg font-semibold">
                  {highlightedCandidate.first_name?.charAt(0)}{highlightedCandidate.last_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {highlightedCandidate.first_name} {highlightedCandidate.last_name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    {highlightedCandidate.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {highlightedCandidate.email}
                      </div>
                    )}
                    {highlightedCandidate.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {highlightedCandidate.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeHighlightPanel}
              >
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
                      currentHighlightStatus === option.value
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
                  setEditingCandidate(highlightedCandidate);
                  closeHighlightPanel();
                }}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Full Profile
              </Button>
              {highlightedCandidate.email && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailModalOpen(true);
                    setEmailRecipient(highlightedCandidate);
                    closeHighlightPanel();
                  }}
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              )}
              {Object.keys(highlightedChanges).length > 0 && (
                <Badge className="ml-auto bg-orange-100 text-orange-800">
                  {Object.keys(highlightedChanges).length} unsaved change{Object.keys(highlightedChanges).length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-3 py-2 text-sm bg-white text-slate-700"
            value={selectedViewId || ""}
            onChange={(e) => setSelectedViewId(e.target.value || null)}
          >
            <option value="">Default View</option>
            {views.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <Button variant="outline" className="gap-2" onClick={() => setShowViewSettings(true)} disabled={!selectedViewId}>
            Edit View
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setShowDeleteViewConfirm(true)}
            disabled={!selectedViewId || !canDeleteCurrentView}
          >
            Delete View
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setSelectedViewId(null); setShowViewSettings(true); }}>
            New View
          </Button>
        </div>
        <div className="text-sm text-slate-600">
          {currentView ? `Filters: ${viewStatuses.length > 0 ? viewStatuses.map(s => s.replace(/_/g, ' ')).join(", ") : "None"}` : "Default filters"}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search candidates by name, email, skills, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 whitespace-nowrap">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {paginatedCandidates.length === 0 ? 0 : startIndex + 1}-{startIndex + paginatedCandidates.length} of {filteredAndSorted.length} candidates
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

      <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-slate-50">
        <div className="text-sm text-slate-700">
          {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select rows to mass update or delete"}
        </div>
        <div className="flex items-center gap-2">
          <PermissionGate entity="Candidate" action="update">
            <Button variant="secondary" disabled={selectedIds.size === 0} onClick={() => setShowBulkUpdate(true)}>
              Mass Update
            </Button>
          </PermissionGate>
          <PermissionGate entity="Candidate" action="delete">
            <Button variant="destructive" disabled={selectedIds.size === 0} onClick={() => setShowBulkDelete(true)}>
              Delete Selected
            </Button>
          </PermissionGate>
        </div>
      </div>

      {viewType === "list" && loading ? (
        <SkeletonTable rows={10} cols={8} />
      ) : viewType === "list" && paginatedCandidates.length > 0 ? (
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        Quick Edit
                      </th>
                      {defaultColumns.filter(col => visibleColumns.includes(col.key)).map(col => (
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
                    {paginatedCandidates.map(candidate => (
                      <TableRow
                        key={candidate.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          highlightedCandidate?.id === candidate.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <TableCell className="px-4 py-3">
                          <Checkbox
                            checked={selectedIds.has(candidate.id)}
                            onCheckedChange={() => toggleSelect(candidate.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleHighlightCandidate(candidate); }}
                            className="h-8 text-xs"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Quick Edit
                          </Button>
                        </TableCell>
                        {defaultColumns.filter(col => visibleColumns.includes(col.key)).map(col => {
                          const value = candidate[col.key];
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm text-slate-700">
                              {col.key === "status" && value ? (
                                <Badge className={getCandidateStatusColor(value)}>
                                  {value.replace(/_/g, " ")}
                                </Badge>
                              ) : col.key === "first_name" ? (
                                <Link
                                  to={createPageUrl(`CandidateDetails?id=${candidate.id}`)}
                                  className="font-medium text-blue-600 hover:underline"
                                  title="Open candidate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {candidate.first_name} {candidate.last_name}
                                </Link>
                              ) : col.key === "email" ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-3 h-3" />
                                  {value}
                                </div>
                              ) : col.key === "phone" ? (
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                  <Phone className="w-3 h-3" />
                                  {value}
                                </div>
                              ) : col.key === "location" ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {value}
                                </div>
                              ) : col.key === "skills" && Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-1">
                                  {value.slice(0, 3).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {value.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{value.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : col.key === "created_date" || col.key === "updated_date" ? (
                                value ? new Date(value).toLocaleDateString() : "—"
                              ) : typeof value === "number" && col.key === "bench_match_score" ? (
                                <Badge className={value >= 75 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                                  {Math.round(value)}
                                </Badge>
                              ) : (
                                value || "—"
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(createPageUrl("CandidateDetails") + `?id=${candidate.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {can("Candidate", "update") && (
                                <DropdownMenuItem onClick={() => handleEdit(candidate)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {candidate.email && (
                                <DropdownMenuItem onClick={() => { setEmailRecipient(candidate); setEmailModalOpen(true); }}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                              )}
                              {can("Candidate", "delete") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteCandidate(candidate.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
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
                
                {/* Page numbers */}
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
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">No candidates found</h3>
              <p className="text-slate-600 mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first candidate"}
              </p>
              <PermissionGate entity="Candidate" action="create">
                <Button onClick={() => { setShowForm(true); setEditingCandidate(null); }} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Candidate
                </Button>
              </PermissionGate>
            </CardContent>
        </Card>
      )}

      <RightPreviewPanel
        open={!!selectedCandidate && !showForm && !highlightedCandidate}
        title="Candidate Details"
        onClose={() => setSelectedCandidate(null)}
      >
        {selectedCandidate && (
          <CandidatePreview
            candidate={selectedCandidate}
            onEdit={handleEdit}
            onUpdated={() => {
              loadCandidates(true);
              emitEntityChanged("Candidate");
              const updated = (candidates || []).find(c => c.id === selectedCandidate.id);
              if (updated) setSelectedCandidate(updated);
            }}
          />
        )}
      </RightPreviewPanel>

      {showForm && (
        <CandidateForm
          candidate={editingCandidate}
          onSave={handleAddCandidate}
          onCancel={() => { setShowForm(false); setEditingCandidate(null); }}
        />
      )}

      {showImport && (
        <ImportModal
          open={showImport}
          onClose={() => setShowImport(false)}
          entityName="Candidates"
          entitySdk={base44.entities.Candidate}
          onImported={() => { setShowImport(false); loadCandidates(true); emitEntityChanged("Candidate"); }}
        />
      )}

      {showDelete && candidateToDelete && (
        <DeleteConfirmModal
          open={showDelete}
          title="Delete Candidate"
          message={`Are you sure you want to delete ${candidateToDelete.first_name} ${candidateToDelete.last_name}? This action cannot be undone.`}
          confirmLabel="Delete Candidate"
          onConfirm={deleteCandidate}
          onCancel={() => { setShowDelete(false); setCandidateToDelete(null); }}
        />
      )}

      {showBulkDelete && selectedIds.size > 0 && (
        <DeleteConfirmModal
          open={showBulkDelete}
          title="Delete Selected Candidates"
          message={`Are you sure you want to delete ${selectedIds.size} selected candidate(s)? This action cannot be undone.`}
          confirmLabel="Delete Candidates"
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDelete(false)}
        />
      )}

      {showBulkUpdate && selectedIds.size > 0 && (
        <CandidatesBulkUpdateModal
          open={showBulkUpdate}
          selectedIds={Array.from(selectedIds)}
          onClose={() => { setShowBulkUpdate(false); setSelectedIds(new Set()); }}
          onUpdated={() => {
            loadCandidates(true);
            emitEntityChanged("Candidate");
            setShowBulkUpdate(false);
            setSelectedIds(new Set());
          }}
        />
      )}

      <ListViewSettingsModal
        open={showViewSettings}
        onClose={() => setShowViewSettings(false)}
        initial={currentView || { name: "", filters: { status: [] }, visibility: "private", sort: "-created_date" }}
        statusOptions={statusOptions}
        onSave={saveView}
        availableColumns={defaultColumns}
        selectedColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
      />

      {showDeleteViewConfirm && currentView && (
        <DeleteConfirmModal
          open={showDeleteViewConfirm}
          title="Delete List View"
          message={`Are you sure you want to delete the view "${currentView.name}"? This action cannot be undone.`}
          confirmLabel="Delete View"
          onConfirm={handleDeleteView}
          onCancel={() => setShowDeleteViewConfirm(false)}
        />
      )}

      <BulkBenchScorer
        open={showBenchScorer}
        onClose={() => setShowBenchScorer(false)}
        onDone={() => {
          setShowBenchScorer(false);
          loadCandidates(true);
          emitEntityChanged("Candidate");
        }}
      />

      {emailModalOpen && emailRecipient && (
        <EmailModal
          open={emailModalOpen}
          onClose={() => { setEmailModalOpen(false); setEmailRecipient(null); }}
          recipient={emailRecipient}
        />
      )}

      {showBulkResumeUpload && (
        <BulkResumeUpload
          open={showBulkResumeUpload}
          onClose={() => setShowBulkResumeUpload(false)}
          onComplete={() => {
            setShowBulkResumeUpload(false);
            loadCandidates(true);
          }}
        />
      )}

      {showPasteToAdd && (
        <PasteToAddCandidate
          open={showPasteToAdd}
          onClose={() => setShowPasteToAdd(false)}
          onSuccess={() => {
            setShowPasteToAdd(false);
            loadCandidates(true);
            emitEntityChanged("Candidate");
          }}
        />
      )}
    </div>
  );
}
