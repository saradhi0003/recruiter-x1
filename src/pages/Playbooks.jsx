import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  TrendingUp,
  Clock,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PlaybookSmartSearch from "@/components/playbooks/PlaybookSmartSearch";
import PlaybookForm from "@/components/playbooks/PlaybookForm";

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const loadPlaybooks = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Playbook.filter({ is_active: true }, "-updated_date");
      setPlaybooks(data || []);
    } catch (error) {
      console.error("Error loading playbooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingPlaybook) {
        await base44.entities.Playbook.update(editingPlaybook.id, data);
      } else {
        await base44.entities.Playbook.create(data);
      }
      await loadPlaybooks();
      setShowForm(false);
      setEditingPlaybook(null);
    } catch (error) {
      console.error("Error saving playbook:", error);
      alert("Failed to save playbook");
    }
  };

  const filteredPlaybooks = playbooks.filter(pb => {
    if (filterCategory === "all") return true;
    return pb.category === filterCategory;
  });

  const sortedPlaybooks = [...filteredPlaybooks].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.usage_count || 0) - (a.usage_count || 0);
      case "rating":
        return (b.effectiveness_rating || 0) - (a.effectiveness_rating || 0);
      case "recent":
      default:
        return new Date(b.updated_date) - new Date(a.updated_date);
    }
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "onboarding", label: "Onboarding" },
    { value: "recruiting", label: "Recruiting" },
    { value: "client_management", label: "Client Management" },
    { value: "procedures", label: "Procedures" },
    { value: "templates", label: "Templates" },
    { value: "best_practices", label: "Best Practices" },
    { value: "interview_guides", label: "Interview Guides" },
    { value: "compliance", label: "Compliance" }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      onboarding: "bg-blue-100 text-blue-800",
      recruiting: "bg-purple-100 text-purple-800",
      client_management: "bg-green-100 text-green-800",
      procedures: "bg-orange-100 text-orange-800",
      templates: "bg-pink-100 text-pink-800",
      best_practices: "bg-yellow-100 text-yellow-800",
      interview_guides: "bg-indigo-100 text-indigo-800",
      compliance: "bg-red-100 text-red-800"
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <div style={{ padding: "20px 24px", background: "#fff", borderBottom: "1px solid #E5E5EA" }}>
      <Breadcrumbs items={[{ label: "Playbooks" }]} />

      <PageHeader
        title="Knowledge Base & Playbooks"
        subtitle="Document and share best practices, processes, and workflows"
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSearch(!showSearch)}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              Smart Search
            </Button>
            <Button
              onClick={() => {
                setEditingPlaybook(null);
                setShowForm(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Playbook
            </Button>
          </div>
        }
      />

      {/* Smart Search */}
      {showSearch && (
        <PlaybookSmartSearch />
      )}

      {/* Filters and Sort */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filter:</span>
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={filterCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterCategory(cat.value)}
                  className="text-xs"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-slate-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-slate-200 rounded px-2 py-1"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPlaybooks.map((playbook) => (
          <Card key={playbook.id} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className={`${getCategoryColor(playbook.category)} capitalize`}>
                  {playbook.category.replace(/_/g, " ")}
                </Badge>
                {playbook.effectiveness_rating && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span>{playbook.effectiveness_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <Link
                to={createPageUrl(`PlaybookDetails?id=${playbook.id}`)}
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {playbook.title}
              </Link>
            </CardHeader>

            <CardContent className="space-y-3">
              {playbook.description && (
                <p className="text-sm text-slate-700 line-clamp-3">
                  {playbook.description}
                </p>
              )}

              {playbook.tags && playbook.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {playbook.tags.slice(0, 4).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {playbook.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{playbook.tags.length - 4} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {playbook.usage_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  v{playbook.version || "1.0"}
                </span>
                {playbook.steps && (
                  <span>{playbook.steps.length} steps</span>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Link to={createPageUrl(`PlaybookDetails?id=${playbook.id}`)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <BookOpen className="w-4 h-4" />
                    View
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPlaybook(playbook);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedPlaybooks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {filterCategory === "all" 
                ? "No playbooks yet" 
                : `No playbooks in ${filterCategory.replace(/_/g, " ")}`}
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first playbook to document your recruitment processes
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Playbook
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Playbook Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <PlaybookForm
              playbook={editingPlaybook}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingPlaybook(null);
              }}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}