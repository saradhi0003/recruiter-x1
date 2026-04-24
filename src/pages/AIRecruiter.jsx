import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { usePermissions } from "@/components/common/PermissionsContext";
import AccessBlocker from "@/components/common/AccessBlocker";
import AIRecruiterDashboard from "@/components/ai-recruiter/AIRecruiterDashboard";
import { Loader2 } from "lucide-react";

export default function AIRecruiter() {
  const { can, isAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        const user = await base44.auth.me();
        setMe(user);
        // Check if user can view jobs and candidates
        const canViewJobs = can("Job", "view");
        const canViewCandidates = can("Candidate", "view");
        setHasAccess(canViewJobs && canViewCandidates);
      } catch (error) {
        console.error("Access check failed:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, [can]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Loading AI Recruiter...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You need permission to view Jobs and Candidates to use AI Recruiter.</p>
        </div>
      </div>
    );
  }

  return <AIRecruiterDashboard user={me} />;
}