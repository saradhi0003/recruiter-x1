
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  LayoutGrid,
  List as ListIcon,
  Settings2,
  MoreHorizontal,
  Eye,
  Trash2,
  Save,
  Loader2,
  X,
  Zap,
  CheckSquare,
  Edit,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import TaskForm from "../components/tasks/TaskForm";
import PermissionGate from "@/components/common/PermissionGate";
import PageHeader from "@/components/common/PageHeader";
import KanbanBoard from "../components/tasks/KanbanBoard";
import ViewSettingsModal from "../components/tasks/ViewSettingsModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { usePermissions } from "@/components/common/PermissionsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { Checkbox } from "@/components/ui/checkbox";
import { addNotification } from "@/components/notifications/NotificationToast";

// Placeholder for SkeletonTable if not imported
const SkeletonTable = ({ rows, cols }) => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {[...Array(cols)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                {[...Array(cols)].map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const TaskCard = ({ task, onClick }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.pending;
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
      isOverdue ? 'border-l-red-500' : 'border-l-blue-500'
    }`} onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 truncate">
              {task.title}
            </h3>
            <p className="text-slate-600 text-sm truncate">{task.assigned_to}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(task.status)}>
              {task.status?.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                Overdue
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {task.due_date && (
            <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
              <Calendar className="w-4 h-4" />
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
          {task.related_entity && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span>Related to: {task.related_entity}</span>
            </div>
          )}
          {task.description && (
            <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-700">
              {task.description.substring(0, 100)}...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceTimeoutRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [formTask, setFormTask] = useState(null);
  const [views, setViews] = useState([]);
  const [selectedViewId, setSelectedViewId] = useState(null);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [mode, setMode] = useState("board");
  const [showDelete, setShowDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [highlightedTask, setHighlightedTask] = useState(null);
  const [highlightedChanges, setHighlightedChanges] = useState({});
  const [savingHighlighted, setSavingHighlighted] = useState(false);

  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const { listFilterFor, me } = usePermissions();

  const loadTasks = useCallback(async (force = false) => {
    if (!force && tasks.length > 0) return;
    setLoading(true);
    try {
      const filter = listFilterFor("Task");
      const tasksData = await (filter ? base44.entities.Task.filter(filter, "-created_date") : base44.entities.Task.list("-created_date"));
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading tasks:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to load tasks" });
    } finally {
      setLoading(false);
    }
  }, [listFilterFor, tasks.length]);

  useEffect(() => {
    const initialFullLoad = async () => {
      setLoading(true);
      try {
        const usersData = await base44.entities.User.list();
        setUsers(usersData);
        await loadTasks();
      } catch (error) {
        console.error("Error during initial full data load:", error);
        addNotification({ type: "error", title: "Error", message: "Failed initial data load" });
      } finally {
        setLoading(false);
      }
    };
    initialFullLoad();
  }, [loadTasks]);

  useEffect(() => {
    const loadViews = async () => {
      try {
        const list = await base44.entities.TaskView.list();
        const visibleViews = list.filter(v => {
          if (me?.role === "admin" || v.created_by?.endsWith("admin") || (me && v.created_by === me.email && me.role === "admin")) {
            return true;
          }
          if (v.visibility === "team") return true;
          if (me && v.created_by === me.email) return true;
          return false;
        });
        setViews(visibleViews);
        const def = visibleViews.find(v => v.is_default) || visibleViews[0] || null;
        if (def) {
          setSelectedViewId(def.id);
          setMode(def.view_type || "board");
        } else {
          setSelectedViewId(null);
          setMode("board");
        }
      } catch (e) {
        console.error("Error loading task views:", e);
        addNotification({ type: "error", title: "Error", message: "Failed to load task views" });
        setViews([]);
        setSelectedViewId(null);
      }
    };
    loadViews();
  }, [me]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const currentView = views.find(v => v.id === selectedViewId) || null;
  const viewFilters = currentView?.filters || {};
  const viewStatuses = Array.isArray(viewFilters.status) ? viewFilters.status : [];

  let filteredTasks = tasks.filter(task => {
    const matchesSearch = !debouncedSearchTerm.trim() ||
      task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (task.assigned_to || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (task.status || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesViewStatus = viewStatuses.length === 0 || viewStatuses.includes(task.status);
    return matchesSearch && matchesViewStatus;
  });

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  // The filteredTasks array is sorted in place here if in list mode.
  // This modified array will then be used for pagination below.
  if (mode === "list") {
    filteredTasks.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (!aVal) return sortOrder === "asc" ? -1 : 1;
      if (!bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Use the (potentially sorted) filteredTasks as the base for pagination
  const filteredAndSorted = filteredTasks;

  // Calculate pagination for list view
  const totalPages = Math.ceil(filteredAndSorted.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTasks = filteredAndSorted.slice(startIndex, endIndex);

  // Reset to page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSorted.length, sortBy, sortOrder, selectedViewId, mode]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  useEffect(() => {
    setSelectedIds(new Set());
  }, [mode, selectedViewId, tasks.length]);

  const saveView = async (payload) => {
    try {
      if (selectedViewId && views.some(v => v.id === selectedViewId)) {
        const updated = await base44.entities.TaskView.update(selectedViewId, payload);
        setViews(views.map(v => (v.id === updated.id ? updated : v)));
        addNotification({ type: "success", title: "View Updated", message: `'${updated.name}' updated successfully` });
      } else {
        const created = await base44.entities.TaskView.create(payload);
        setViews([created, ...views]);
        setSelectedViewId(created.id);
        addNotification({ type: "success", title: "View Created", message: `'${created.name}' created successfully` });
      }
      setMode(payload.view_type || "board");
      setShowViewSettings(false);
    } catch (e) {
      console.error("Error saving task view:", e);
      addNotification({ type: "error", title: "Error", message: "Failed to save task view" });
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await base44.entities.Task.create(taskData);
      setShowForm(false);
      await loadTasks(true);
      addNotification({ type: "success", title: "Task Created", message: "New task added successfully!" });
    } catch (error) {
      console.error("Error adding task:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to add task" });
    }
  };

  const handleEditTask = async (taskId, taskData) => {
    try {
      await base44.entities.Task.update(taskId, taskData);
      setShowForm(false);
      setFormTask(null);
      await loadTasks(true);
      addNotification({ type: "success", title: "Task Updated", message: "Task updated successfully!" });
    } catch (error) {
      console.error("Error updating task:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to update task" });
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await base44.entities.Task.delete(taskToDelete.id);
      setShowDelete(false);
      setTaskToDelete(null);
      await loadTasks(true);
      addNotification({ type: "success", title: "Task Deleted", message: `'${taskToDelete.title}' deleted successfully!` });
    } catch (error) {
      console.error("Error deleting task:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to delete task" });
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await Promise.all(ids.map(id => base44.entities.Task.delete(id)));
      setShowBulkDelete(false);
      setSelectedIds(new Set());
      await loadTasks(true);
      addNotification({ type: "success", title: "Tasks Deleted", message: `${ids.length} tasks deleted successfully!` });
    } catch (error) {
      console.error("Error deleting tasks:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to delete tasks" });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = (checked) => {
    if (checked) {
      const all = new Set(paginatedTasks.map(t => t.id)); // Select all visible on current page
      setSelectedIds(all);
    } else {
      setSelectedIds(new Set());
    }
  };

  const allVisibleSelected = paginatedTasks.length > 0 && paginatedTasks.every(t => selectedIds.has(t.id));
  const someVisibleSelected = paginatedTasks.some(t => selectedIds.has(t.id)) && !allVisibleSelected;

  const openTask = (task) => {
    window.location.href = createPageUrl(`TaskDetails?id=${task.id}`);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const validColumns = ["pending", "in_progress", "completed", "cancelled"];
    if (!validColumns.includes(destination.droppableId)) {
      console.warn("Invalid destination column for drag:", destination.droppableId);
      return;
    }

    const taskToUpdate = tasks.find(t => t.id === draggableId);
    if (!taskToUpdate) return;

    try {
      const newStatus = destination.droppableId;
      await base44.entities.Task.update(draggableId, { status: newStatus });
      await loadTasks(true);
      addNotification({ type: "success", title: "Task Status Updated", message: `Task '${taskToUpdate.title}' moved to ${newStatus.replace('_', ' ')}.` });
    } catch (error) {
      console.error("Error updating task status on drag:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to update task status" });
    }
  };

  const defaultColumns = ["pending","in_progress","completed","cancelled"];
  const boardColumns = (currentView?.columns && currentView.columns.length > 0) ? currentView.columns : defaultColumns;

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
    overdue: tasks.filter(t =>
      t.due_date &&
      new Date(t.due_date) < new Date() &&
      t.status !== 'completed'
    )
  };

  const handleHighlightTask = (task) => {
    setHighlightedTask(task);
    setHighlightedChanges({});
    setSelectedTask(null);
  };

  const updateHighlightedField = (field, value) => {
    setHighlightedChanges(prev => ({ ...prev, [field]: value }));
  };

  const saveHighlightedChanges = async () => {
    if (!highlightedTask || Object.keys(highlightedChanges).length === 0) return;

    setSavingHighlighted(true);
    try {
      await base44.entities.Task.update(highlightedTask.id, highlightedChanges);
      addNotification({
        type: "success",
        title: "Updated",
        message: `${highlightedTask.title} updated successfully`
      });
      setHighlightedTask(null);
      setHighlightedChanges({});
      await loadTasks(true);
    } catch (error) {
      console.error("Error updating task:", error);
      addNotification({ type: "error", title: "Error", message: "Failed to update task" });
    }
    setSavingHighlighted(false);
  };

  const closeHighlightPanel = () => {
    setHighlightedTask(null);
    setHighlightedChanges({});
  };

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-800 border-slate-300" },
    { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 border-green-300" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-300" }
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-slate-100 text-slate-800 border-slate-300" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800 border-orange-300" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800 border-red-300" }
  ];

  const currentStatus = highlightedChanges.status || highlightedTask?.status || "pending";
  const currentPriority = highlightedChanges.priority || highlightedTask?.priority || "medium";

  const visibleColumns = [
    { key: "title", label: "Title" },
    { key: "assigned_to", label: "Assignee" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "due_date", label: "Due Date" },
    { key: "related_entity", label: "Related" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Assign and track team tasks"
        right={
          <PermissionGate entity="Task" action="create">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-white text-blue-700 hover:bg-slate-50" onClick={() => loadTasks(true)}>
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
              <Button onClick={() => { setShowForm(true); setFormTask(null); setSelectedTask(null); setHighlightedTask(null); }} className="gap-2 bg-white text-blue-700 hover:bg-slate-50">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </div>
          </PermissionGate>
        }
      />

      {highlightedTask && (
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-lg font-semibold">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {highlightedTask.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    {highlightedTask.assigned_to && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {highlightedTask.assigned_to}
                      </div>
                    )}
                    {highlightedTask.due_date && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(highlightedTask.due_date).toLocaleDateString()}
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
                  setShowForm(true);
                  setFormTask(highlightedTask);
                  closeHighlightPanel();
                }}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Full Task
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
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{tasksByStatus.pending.length}</p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{tasksByStatus.in_progress.length}</p>
                <p className="text-sm text-slate-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{tasksByStatus.completed.length}</p>
                <p className="text-sm text-slate-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{tasksByStatus.overdue.length}</p>
                <p className="text-sm text-slate-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-md text-sm border ${mode === "board" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"}`}
            onClick={() => setMode("board")}
            title="Board view"
          >
            <span className="inline-flex items-center gap-1"><LayoutGrid className="w-4 h-4" /> Board</span>
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm border ${mode === "list" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"}`}
            onClick={() => setMode("list")}
            title="List view"
          >
            <span className="inline-flex items-center gap-1"><ListIcon className="w-4 h-4" /> List</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border rounded px-3 py-2 text-sm bg-white text-slate-700"
            value={selectedViewId || ""}
            onChange={(e) => {
              const newViewId = e.target.value || null;
              setSelectedViewId(newViewId);
              const v = views.find(vw => vw.id === newViewId);
              setMode(v ? (v.view_type || "board") : "board");
            }}
          >
            <option value="">Default View</option>
            {views.map(v => (
              <option key={v.id} value={v.id}>{v.name} • {v.view_type === 'board' ? 'Board' : 'List'}</option>
            ))}
          </select>
          <Button variant="outline" className="gap-2 text-slate-700" onClick={() => setShowViewSettings(true)} disabled={!currentView}>
            <Settings2 className="w-4 h-4" /> Edit View
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setSelectedViewId(null); setShowViewSettings(true); }}>
            <Plus className="w-4 h-4" /> New View
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search tasks by title, assignee, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {mode === "list" && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {paginatedTasks.length === 0 ? 0 : startIndex + 1}-{startIndex + paginatedTasks.length} of {filteredAndSorted.length} tasks
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mode === "board" ? (
        <KanbanBoard
          columns={boardColumns}
          tasks={filteredTasks}
          onDragEnd={onDragEnd}
          onCardClick={(task) => { window.location.href = createPageUrl(`TaskDetails?id=${task.id}`); }}
        />
      ) : mode === "list" && loading ? ( // This specific loading state should be redundant with the main 'loading' check
        <SkeletonTable rows={10} cols={7} />
      ) : mode === "list" && paginatedTasks.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                <div className="text-sm text-slate-700">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select rows to bulk delete"}
                </div>
                <PermissionGate entity="Task" action="delete">
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

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
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
                      {visibleColumns.map(col => (
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
                    {paginatedTasks.map(t => (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          highlightedTask?.id === t.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedTask(t)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(t.id)}
                            onCheckedChange={() => toggleSelect(t.id)}
                          />
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHighlightTask(t)}
                            className="h-8 text-xs"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Quick Edit
                          </Button>
                        </td>
                        <td className="px-4 py-3">
                          <Link className="text-blue-600 hover:underline" to={createPageUrl(`TaskDetails?id=${t.id}`)} title="Open task">
                            {t.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{t.assigned_to || "—"}</td>
                        <td className="px-4 py-3 capitalize">{t.priority}</td>
                        <td className="px-4 py-3 capitalize">{t.status?.replace("_"," ")}</td>
                        <td className="px-4 py-3">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3">{t.related_entity || "—"}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={createPageUrl(`TaskDetails?id=${t.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <PermissionGate entity="Task" action="delete">
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => { setTaskToDelete(t); setShowDelete(true); }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
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
                    {visibleColumns.map(col => (
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
                <tbody>
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={visibleColumns.length + 3}>
                      {searchTerm ? (
                        <div className="p-12 text-center">
                          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="font-semibold text-slate-900 mb-2">No results found</h3>
                          <p className="text-slate-600 mb-4">Try adjusting your search criteria or view filters.</p>
                        </div>
                      ) : (
                        <div className="p-12 text-center">
                          <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="font-semibold text-slate-900 mb-2">No tasks found</h3>
                          <p className="text-slate-600 mb-4">Get started by creating your first task.</p>
                          <PermissionGate entity="Task" action="create">
                            <Button onClick={() => { setShowForm(true); setFormTask(null); }} className="gap-2">
                              <Plus className="w-4 h-4" />
                              Create First Task
                            </Button>
                          </PermissionGate>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <TaskForm
          users={users}
          task={formTask}
          onSave={formTask ? handleEditTask : handleAddTask}
          onCancel={() => { setShowForm(false); setFormTask(null); }}
        />
      )}

      <ViewSettingsModal
        open={showViewSettings}
        onClose={() => setShowViewSettings(false)}
        initial={currentView || { name: "", view_type: mode, columns: defaultColumns, filters: { status: [] }, visibility: "private", sort: "-created_date" }}
        onSave={saveView}
      />

      {showDelete && taskToDelete && (
        <DeleteConfirmModal
          open={showDelete}
          title="Delete Task"
          message={`Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete Task"
          onConfirm={handleDeleteTask}
          onCancel={() => { setShowDelete(false); setTaskToDelete(null); }}
        />
      )}

      {showBulkDelete && selectedIds.size > 0 && (
        <DeleteConfirmModal
          open={showBulkDelete}
          title="Delete Selected Tasks"
          message={`Are you sure you want to delete ${selectedIds.size} selected task(s)? This action cannot be undone.`}
          confirmLabel="Delete Tasks"
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDelete(false)}
        />
      )}
    </div>
  );
}
