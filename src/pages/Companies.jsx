
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Building2,
  ExternalLink,
  Users,
  Briefcase,
  MoreHorizontal,
  Edit,
  Eye,
  Upload,
  MailPlus,
  Trash,
  ArrowUpDown,
  Save,         // NEW
  Loader2,      // NEW
  X,            // NEW
  Zap,          // NEW
  RefreshCcw,   // NEW
  MapPin,       // NEW
  ChevronUp,    // NEW
  ChevronDown,   // NEW
  ChevronsLeft,  // NEW
  ChevronsRight, // NEW
  ChevronLeft,   // NEW
  ChevronRight   // NEW
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
import { Company, Job } from "@/entities/all";
import { User } from "@/entities/User";
import CompanyForm from "../components/companies/CompanyForm";
import PermissionGate from "@/components/common/PermissionGate";
import PageHeader from "@/components/common/PageHeader";
import ImportModal from "@/components/common/ImportModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CompanyEmailBlastModal from "@/components/companies/CompanyEmailBlastModal";
import CompanyDetailsModal from "@/components/companies/CompanyDetailsModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { usePermissions } from "@/components/common/PermissionsContext";
import ListViewSettingsModal from "@/components/common/ListViewSettingsModal";
import { CompanyView } from "@/entities/CompanyView";
import BulkUpdateModal from "@/components/companies/BulkUpdateModal";
import { Checkbox } from "@/components/ui/checkbox";
import useDebouncedValue from "@/components/common/useDebouncedValue";

// Placeholder for a notification system
const addNotification = ({ type, title, message }) => {
  console.log(`Notification (${type}): ${title} - ${message}`);
  // In a real app, you'd integrate with a toast library (e.g., react-hot-toast)
};

// Placeholder for an entity change event bus
const emitEntityChanged = (entityType) => {
  console.log(`Entity changed: ${entityType}`);
  // In a real app, this would trigger re-fetching or cache invalidation mechanisms
};

export default function CompaniesPage() { // Renamed component
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [showForm, setShowForm] = useState(false);
  const [formCompany, setFormCompany] = useState(null); // Renamed from editingCompany
  const [showImport, setShowImport] = useState(false);
  const [showEmailBlast, setShowEmailBlast] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [views, setViews] = useState([]);
  const [selectedViewId, setSelectedViewId] = useState(null);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set()); // Changed to Set
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const [highlightedCompany, setHighlightedCompany] = useState(null); // NEW
  const [highlightedChanges, setHighlightedChanges] = useState({}); // NEW
  const [savingHighlighted, setSavingHighlighted] = useState(false); // NEW
  const [selectedCompany, setSelectedCompany] = useState(null); // NEW: for general selection/preview
  const [viewType, setViewType] = useState("list"); // NEW: default view type

  const [rowsPerPage, setRowsPerPage] = useState(25); // NEW
  const [currentPage, setCurrentPage] = useState(1); // NEW

  const { listFilterFor, me } = usePermissions();

  const loadCompanies = useCallback(async (force = false) => { // Renamed from loadData, added force parameter
    setLoading(true);
    try {
      const companyFilter = listFilterFor("Company");
      const [companiesData, jobsData, usersData] = await Promise.all([
        companyFilter ? Company.filter(companyFilter, "-created_date") : Company.list("-created_date"),
        Job.list("-created_date", 500),
        User.list().catch(() => [])
      ]);
      setCompanies(companiesData);
      setJobs(jobsData);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  }, [listFilterFor]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Load views
  useEffect(() => {
    const loadViews = async () => {
      try {
        const list = await CompanyView.list().catch(() => []);
        // Show admin-created views to everyone, plus user's own views and team views
        const visibleViews = list.filter(v => {
          // If the current user is an admin, they see all views.
          if (me?.role === "admin") {
            return true;
          }
          // If the view was created by an email ending in "admin" (assumed admin-created)
          if (v.created_by?.endsWith("admin")) {
            return true;
          }
          // If the view's visibility is set to "team"
          if (v.visibility === "team") {
            return true;
          }
          // If the view was created by the current user (private view)
          if (me && v.created_by === me.email) {
            return true;
          }
          return false;
        });
        setViews(visibleViews);
        const def = visibleViews.find(v => v.is_default) || visibleViews[0] || null;
        if (def) setSelectedViewId(def.id);
      } catch (e) {
        console.error("Error loading company views:", e);
        setViews([]);
        setSelectedViewId(null);
      }
    };
    loadViews();
  }, [me]);

  // Build quick maps once (OPTIMIZE)
  const jobCounts = React.useMemo(() => {
    const map = new Map();
    for (const j of jobs) {
      if (j.status !== "open") continue;
      const key = j.company_id;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [jobs]);

  const usersMap = React.useMemo(() => {
    const m = new Map();
    (users || []).forEach(u => m.set(u.email, u.full_name || u.email));
    return m;
  }, [users]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredCompanies(companies);
      return;
    }
    const q = debouncedSearch.toLowerCase();
    const filtered = companies.filter(company =>
      company.name?.toLowerCase().includes(q) ||
      (company.industry || "").toLowerCase().includes(q) ||
      (company.location || "").toLowerCase().includes(q)
    );
    setFilteredCompanies(filtered);
  }, [debouncedSearch, companies]);

  const currentView = views.find(v => v.id === selectedViewId) || null;

  // NEW: sorting state derived from view.sort, adapted for new sortBy/sortOrder
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const s = (currentView?.sort || "-created_date");
    setSortBy(s.startsWith("-") ? s.slice(1) : s);
    setSortOrder(s.startsWith("-") ? "desc" : "asc");
  }, [currentView]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc"); // Default to ascending when changing sort field
    }
  };

  // NEW: columns visible (persisted on view)
  const defaultColumns = ["connection", "industry", "location", "primary_contact", "last_name", "contact_numbers", "open_jobs", "status", "created_by", "website", "job_stack_access"];

  // Enhanced filters summary
  const summarizeFilters = (view) => {
    if (!view) return "Default filters";
    const f = view.filters || {};
    const parts = [];
    if (Array.isArray(f.status) && f.status.length) parts.push(`status: ${f.status.join(", ")}`);
    if (f.industry_contains) parts.push(`industry~"${f.industry_contains}"`);
    if (f.location_contains) parts.push(`location~"${f.location_contains}"`);
    if (Array.isArray(f.created_by_in) && f.created_by_in.length) parts.push(`created by: ${f.created_by_in.length} user(s)`);
    if (f.has_website && f.has_website !== "any") parts.push(`website: ${f.has_website}`);
    return parts.length ? `Filters: ${parts.join(" | ")}` : "Default filters";
  };

  // apply filters from currentView
  const viewFilters = React.useMemo(() => currentView?.filters || {}, [currentView]);

  const filteredCompaniesWithView = React.useMemo(() => (filteredCompanies || []).filter(c => {
    const statusOk = !Array.isArray(viewFilters.status) || viewFilters.status.length === 0 || viewFilters.status.includes(c.status);
    const indOk = !viewFilters.industry_contains || (c.industry || "").toLowerCase().includes(String(viewFilters.industry_contains).toLowerCase());
    const locOk = !viewFilters.location_contains || (c.location || "").toLowerCase().includes(String(viewFilters.location_contains).toLowerCase());
    const createdOk = !Array.isArray(viewFilters.created_by_in) || viewFilters.created_by_in.length === 0 || viewFilters.created_by_in.includes(c.created_by);
    const web = viewFilters.has_website || "any";
    const webOk = web === "any" || (web === "yes" ? !!c.website : !c.website);
    return statusOk && indOk && locOk && createdOk && webOk;
  }), [filteredCompanies, viewFilters]);

  // NEW: sort rows client-side by selected field
  const sortedCompanies = React.useMemo(() => {
    const arr = [...filteredCompaniesWithView];
    const dirMul = sortOrder === "asc" ? 1 : -1;

    const getVal = (c) => {
      switch (sortBy) {
        case "name": return (c.name || "").toLowerCase();
        case "industry": return (c.industry || "").toLowerCase();
        case "location": return (c.location || "").toLowerCase();
        case "status": return (c.status || "").toLowerCase();
        case "created_date": return new Date(c.created_date).getTime() || 0;
        case "open_jobs":
          return jobCounts.get(c.id) || 0;
        case "created_by": return (c.created_by || "").toLowerCase();
        default: return (c[sortBy] ?? "").toString().toLowerCase();
      }
    };

    arr.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va < vb) return -1 * dirMul;
      if (va > vb) return 1 * dirMul;
      return 0;
    });
    return arr;
  }, [filteredCompaniesWithView, sortBy, sortOrder, jobCounts]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedCompanies.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCompanies = sortedCompanies.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, currentView, sortBy, sortOrder]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };


  // selection helpers (must come AFTER sortedCompanies is defined)
  const allVisibleSelected = sortedCompanies.length > 0 && selectedIds.size === sortedCompanies.length;
  const someVisibleSelected = selectedIds.size > 0 && selectedIds.size < sortedCompanies.length;

  const toggleSelectAllVisible = (checked) => {
    if (checked) setSelectedIds(new Set(sortedCompanies.map(c => c.id)));
    else setSelectedIds(new Set());
  };
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const saveView = async (payload) => {
    try {
      if (currentView) {
        const updated = await CompanyView.update(currentView.id, payload);
        setViews(views.map(v => (v.id === updated.id ? updated : v)));
      } else {
        const created = await CompanyView.create(payload);
        setViews([created, ...views]);
        setSelectedViewId(created.id);
      }
      setShowViewSettings(false);
    } catch (e) {
      console.error("Error saving company view:", e);
    }
  };

  const handleAddCompany = async (companyData) => {
    try {
      if (formCompany) { // Changed from editingCompany
        await Company.update(formCompany.id, companyData);
        setFormCompany(null); // Changed from editingCompany
      } else {
        await Company.create(companyData);
      }
      setShowForm(false);
      loadCompanies();
    } catch (error) {
      console.error(`Error ${formCompany ? 'updating' : 'adding'} company:`, error);
    }
  };

  const deleteCompany = async () => {
    if (!companyToDelete) return;
    try {
      await Company.delete(companyToDelete.id);
      setShowDelete(false);
      setCompanyToDelete(null);
      loadCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  // bulk delete handler
  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) { setShowBulkDelete(false); return; } // Changed .length to .size
    setBulkDeleteLoading(true);
    try {
      for (const id of Array.from(selectedIds)) { // Iterate over Set
        await Company.delete(id);
        await new Promise((r) => setTimeout(r, 30));
      }
      setShowBulkDelete(false);
      setSelectedIds(new Set()); // Reset selectedIds
      loadCompanies();
    } catch (error) {
      console.error("Error during bulk delete:", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const getJobCount = (companyId) => jobCounts.get(companyId) || 0;

  // Updated statusOptions with color property
  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800 border-green-300" },
    { value: "prospect", label: "Prospect", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "inactive", label: "Inactive", color: "bg-slate-100 text-slate-800 border-slate-300" }
  ];

  const typeOptions = [ // NEW
    { value: "client", label: "Client", color: "bg-purple-100 text-purple-800 border-purple-300" },
    { value: "internal", label: "Internal", color: "bg-indigo-100 text-indigo-800 border-indigo-300" }
  ];

  const getStatusColor = (status) => {
    const option = statusOptions.find(o => o.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800"; // Fallback
  };

  const getUserLabel = (email) => usersMap.get(email) || email || "—";

  const getLastName = (fullName) => {
    if (!fullName) return "—";
    const parts = String(fullName).trim().split(/\s+/);
    return parts.length > 1 ? parts[parts.length - 1] : "—";
  };
  const getPrimarySecondaryPhones = (contacts = []) => {
    if (!Array.isArray(contacts) || contacts.length === 0) return { primary: "—", secondary: "—" };
    const primary = contacts.find(c => c.is_primary);
    const nonPrimaryContacts = contacts.filter(c => !c.is_primary);
    const secondary = nonPrimaryContacts.length > 0 ? nonPrimaryContacts[0] : null;
    return {
      primary: primary?.phone || "—",
      secondary: secondary?.phone || "—"
    };
  };

  // NEW: column definitions to render dynamically
  const columnDefs = {
    connection: {
      key: "connection", // Added key
      label: "Connection",
      sortable: true,
      render: (company) => (
        <div>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedCompanyId(company.id); setShowDetails(true); }}
            className="font-medium text-blue-600 hover:underline"
            title="Open connection"
          >
            {company.name}
          </button>
          <p className="text-sm text-slate-500">Added {new Date(company.created_date).toLocaleDateString()}</p>
        </div>
      )
    },
    industry: {
      key: "industry", // Added key
      label: "Industry",
      sortable: true,
      render: (c) => c.industry || "Not specified"
    },
    location: {
      key: "location", // Added key
      label: "Location",
      sortable: true,
      render: (c) => c.location || "Not specified"
    },
    primary_contact: {
      key: "primary_contact", // Added key
      label: "Primary Contact",
      sortable: false,
      render: (c) => {
        const p = c.contacts?.find(ct => ct.is_primary) || c.contacts?.[0];
        return p ? (
          <div>
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-slate-600">{p.title}</p>
            <p className="text-sm text-slate-600">{p.email}</p>
          </div>
        ) : "No contact";
      }
    },
    last_name: {
      key: "last_name", // Added key
      label: "Last Name",
      sortable: false,
      render: (c) => {
        const p = c.contacts?.find(ct => ct.is_primary) || c.contacts?.[0];
        return getLastName(p?.name);
      }
    },
    contact_numbers: {
      key: "contact_numbers", // Added key
      label: "Contact Numbers",
      sortable: false,
      render: (c) => {
        const { primary, secondary } = getPrimarySecondaryPhones(c.contacts);
        return (
          <div className="text-sm">
            <div><span className="text-slate-500">Primary:</span> {primary}</div>
            <div><span className="text-slate-500">Secondary:</span> {secondary}</div>
          </div>
        );
      }
    },
    open_jobs: {
      key: "open_jobs", // Added key
      label: "Open Jobs",
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-slate-400" />
          {getJobCount(c.id)}
        </div>
      )
    },
    status: {
      key: "status", // Added key
      label: "Status",
      sortable: true,
      render: (c) => <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
    },
    created_by: {
      key: "created_by", // Added key
      label: "Created By",
      sortable: true,
      render: (c) => getUserLabel(c.created_by)
    },
    website: {
      key: "website", // Added key
      label: "Website",
      sortable: false,
      render: (c) => c.website ? (
        <a href={c.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
          <ExternalLink className="w-3 h-3" />
          Visit
        </a>
      ) : "No website"
    },
    job_stack_access: {
      key: "job_stack_access", // Added key
      label: "Jobs Stack",
      sortable: false,
      render: (c) => c.job_stack_access ? <span className="text-green-600">Yes</span> : "No"
    }
  };

  // Convert visibleColumns keys to full column definition objects for rendering
  const finalVisibleColumns = React.useMemo(() => {
    const selectedKeys = Array.isArray(currentView?.columns) && currentView.columns.length
      ? currentView.columns
      : defaultColumns;
    return selectedKeys
      .map(key => columnDefs[key] ? { ...columnDefs[key], key } : null) // Ensure 'key' is in the object
      .filter(Boolean); // Filter out any nulls if a key doesn't exist in columnDefs
  }, [currentView, columnDefs]);

  const handleHighlightCompany = (company) => {
    setHighlightedCompany(company);
    setHighlightedChanges({});
    setSelectedCompany(null); // Clear general selection when highlighting
  };

  const updateHighlightedField = (field, value) => {
    setHighlightedChanges(prev => ({ ...prev, [field]: value }));
  };

  const saveHighlightedChanges = async () => {
    if (!highlightedCompany || Object.keys(highlightedChanges).length === 0) return;

    setSavingHighlighted(true);
    try {
      await Company.update(highlightedCompany.id, highlightedChanges);
      addNotification({
        type: "success",
        title: "Updated",
        message: `${highlightedCompany.name} updated successfully`
      });
      setHighlightedCompany(null);
      setHighlightedChanges({});
      loadCompanies(true);
      emitEntityChanged("Company");
    } catch (error) {
      console.error("Error updating company:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to update company" });
    }
    setSavingHighlighted(false);
  };

  const closeHighlightPanel = () => {
    setHighlightedCompany(null);
    setHighlightedChanges({});
  };

  const currentStatus = highlightedChanges.status || highlightedCompany?.status || "prospect";
  const currentType = highlightedChanges.type || highlightedCompany?.type || "client"; // Assuming 'type' field for Company

  // Placeholder SkeletonTable component
  const SkeletonTablePlaceholder = () => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  <div className="h-4 w-12 bg-slate-200 rounded animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.from({ length: 10 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="px-4 py-3"><div className="h-4 w-4 bg-slate-100 rounded animate-pulse"></div></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div></td>
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-100 rounded animate-pulse"></div></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse"></div></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-100 rounded animate-pulse"></div></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse"></div></td>
                  <td className="px-4 py-3 text-right"><div className="h-4 w-10 bg-slate-100 rounded animate-pulse ml-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );


  return (
    <div className="p-6 lg:p-8 space-y-6 relative">
      <PageHeader
        title="Connections" // Updated title
        subtitle="Manage your client and partner companies" // Updated subtitle
        right={
          <PermissionGate entity="Company" action="create">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-white text-blue-700 hover:bg-slate-50" onClick={() => loadCompanies(true)}>
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
              <Button onClick={() => { setShowForm(true); setFormCompany(null); setSelectedCompany(null); setHighlightedCompany(null); }} className="gap-2 bg-white text-blue-700 hover:bg-slate-50">
                <Plus className="w-4 h-4" />
                Add Connection
              </Button>
            </div>
          </PermissionGate>
        }
      />

      {/* Highlight Panel */}
      {highlightedCompany && (
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-lg font-semibold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {highlightedCompany.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    {highlightedCompany.industry && (
                      <span>{highlightedCompany.industry}</span>
                    )}
                    {highlightedCompany.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {highlightedCompany.location}
                        </div>
                      </>
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

            {/* Status Update Section */}
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

            {/* Type Update Section */}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Quick Type Update
              </label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateHighlightedField("type", option.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                      currentType === option.value
                        ? option.color + " shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
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
                  setFormCompany(highlightedCompany); // Use formCompany
                  closeHighlightPanel();
                }}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Full Company
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
                placeholder="Search companies by name or industry..."
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
              <PermissionGate entity="Company" action="create">
                <Button variant="outline" className="gap-2 whitespace-nowrap" onClick={() => setShowImport(true)}>
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              </PermissionGate>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View controls */}
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
          <Button variant="outline" className="gap-2" onClick={() => setShowViewSettings(true)} disabled={!currentView}>
            Edit View
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setSelectedViewId(null); setShowViewSettings(true); }}>
            New View
          </Button>
        </div>
        <div className="text-sm text-slate-600">{summarizeFilters(currentView)}</div>
      </div>

      {/* Count and Rows per page */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {paginatedCompanies.length === 0 ? 0 : startIndex + 1}-{startIndex + paginatedCompanies.length} of {sortedCompanies.length} connections
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

      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && ( // Changed .length to .size
        <div className="flex items-center justify-between p-3 border rounded bg-white">
          <div className="text-sm text-slate-700">{selectedIds.size} selected</div> {/* Changed .length to .size */}
          <div className="flex gap-2">
            <PermissionGate entity="Company" action="update">
              <Button variant="outline" className="gap-2" onClick={() => setShowBulkUpdate(true)}>
                <Edit className="w-4 h-4" />
                Update
              </Button>
            </PermissionGate>
            <PermissionGate entity="Company" action="delete">
              <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowBulkDelete(true)}>
                <Trash className="w-4 h-4" />
                Delete
              </Button>
            </PermissionGate>
          </div>
        </div>
      )}

      {/* Updated Table - add Quick Edit column */}
      {viewType === "list" && ( // Conditional rendering for list view
        <>
          {loading ? (
            <SkeletonTablePlaceholder />
          ) : sortedCompanies.length === 0 ? ( // Check if there are ANY results after filter/sort
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">No connections found</h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || (currentView && Object.keys(currentView.filters || {}).length > 0) ? "Try adjusting your search criteria or view filters" : "Get started by adding your first connection"}
              </p>
              <PermissionGate entity="Company" action="create">
                <Button onClick={() => { setShowForm(true); setFormCompany(null); }} className="gap-2"> {/* Use setFormCompany */}
                  <Plus className="w-4 h-4" />
                  Add First Connection
                </Button>
              </PermissionGate>
            </div>
          ) : (
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
                          {finalVisibleColumns.map(col => ( // Use finalVisibleColumns
                            <th
                              key={col.key}
                              className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100"
                              onClick={() => col.sortable && handleSort(col.key)} // Only sort if sortable
                            >
                              <div className="flex items-center gap-1">
                                {col.label}
                                {col.sortable && sortBy === col.key && ( // Only show icon if sortable and currently sorting by this column
                                  sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                                {col.sortable && sortBy !== col.key && ( // Show neutral arrow if sortable but not current sort
                                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
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
                        {paginatedCompanies.map(company => ( // Changed filteredCompanies to sortedCompanies, and now paginatedCompanies
                          <tr
                            key={company.id}
                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                              highlightedCompany?.id === company.id ? "bg-blue-50" : ""
                            }`}
                            onClick={() => setSelectedCompany(company)}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedIds.has(company.id)} // Use .has()
                                onCheckedChange={() => toggleSelect(company.id)}
                              />
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHighlightCompany(company)}
                                className="h-8 text-xs"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Quick Edit
                              </Button>
                            </td>
                            {finalVisibleColumns.map((col) => { // Use finalVisibleColumns
                              return (
                                <td key={`${company.id}-${col.key}`} className="px-4 py-3">
                                  {typeof col.render === "function" ? col.render(company) : null}
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setSelectedCompanyId(company.id); setShowDetails(true); }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <PermissionGate entity="Company" action="update">
                                    <DropdownMenuItem onClick={() => { setFormCompany(company); setShowForm(true); }}> {/* Use setFormCompany */}
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  </PermissionGate>
                                  <PermissionGate entity="Company" action="delete">
                                    <DropdownMenuItem className="text-red-600" onClick={() => { setCompanyToDelete(company); setShowDelete(true); }}>
                                      <Trash className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </PermissionGate>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-4">
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
                      <ChevronLeft className="w-4 h-4 mr-1" />
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

                        if (pageNum < 1 || pageNum > totalPages) return null; // Ensure pageNum is within valid bounds
                        
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
                      <ChevronRight className="w-4 h-4 ml-1" />
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
        </>
      )}

      {showForm && (
        <CompanyForm
          company={formCompany} // Changed from editingCompany
          onSave={handleAddCompany}
          onCancel={() => { setShowForm(false); setFormCompany(null); }} // Use setFormCompany
        />
      )}

      {showImport && (
        <ImportModal
          open={showImport}
          onClose={() => setShowImport(false)}
          entityName="Connections"
          entitySdk={Company}
          onImported={() => { setShowImport(false); loadCompanies(); }}
        />
      )}

      {showEmailBlast && (
        <CompanyEmailBlastModal
          open={showEmailBlast}
          onClose={() => setShowEmailBlast(false)}
          companies={companies}
        />
      )}

      {showDetails && selectedCompanyId && (
        <CompanyDetailsModal
          companyId={selectedCompanyId}
          onClose={() => { setShowDetails(false); setSelectedCompanyId(null); }}
          onUpdated={loadCompanies}
        />
      )}

      {showDelete && companyToDelete && (
        <DeleteConfirmModal
          open={showDelete}
          title="Delete Connection"
          message={`Are you sure you want to delete ${companyToDelete.name}? This action cannot be undone.`}
          confirmLabel="Delete Connection"
          onConfirm={deleteCompany}
          onCancel={() => { setShowDelete(false); setCompanyToDelete(null); }}
        />
      )}

      {/* bulk modals */}
      <BulkUpdateModal
        open={showBulkUpdate}
        onClose={() => setShowBulkUpdate(false)}
        selectedIds={Array.from(selectedIds)} // Pass as array for now, modal might expect it
        onDone={() => { setSelectedIds(new Set()); loadCompanies(); }}
      />
      <DeleteConfirmModal
        open={showBulkDelete}
        title="Delete Selected"
        message={`Delete ${selectedIds.size} connection(s)? This cannot be undone.`} // Changed .length to .size
        confirmLabel="Delete"
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDelete(false)}
        loading={bulkDeleteLoading}
      />

      <ListViewSettingsModal
        open={showViewSettings}
        onClose={() => setShowViewSettings(false)}
        initial={currentView || { name: "", filters: { status: [], has_website: "any" }, visibility: "private", sort: "-created_date", columns: defaultColumns }}
        statusOptions={statusOptions}
        users={users}
        availableColumns={[
          { key: "connection", label: "Connection", locked: true },
          { key: "industry", label: "Industry" },
          { key: "location", label: "Location" },
          { key: "primary_contact", label: "Primary Contact" },
          { key: "last_name", label: "Last Name" },
          { key: "contact_numbers", label: "Contact Numbers" },
          { key: "open_jobs", label: "Open Jobs" },
          { key: "status", label: "Status" },
          { key: "created_by", label: "Created By" },
          { key: "website", label: "Website" },
          { key: "job_stack_access", label: "Jobs Stack Access" }
        ]}
        onSave={saveView}
      />
    </div>
  );
}
