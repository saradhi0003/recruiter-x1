import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

const activityIcons = {
  ai_job_parsed: "📋",
  ai_candidates_matched: "✅",
  ai_candidate_selected: "📌",
  ai_email_draft_created: "✉️",
  ai_email_draft_approved: "👍",
  ai_email_draft_rejected: "❌",
  ai_submission_created: "📤",
  ai_task_created: "✔️",
  ai_error: "⚠️",
};

const activityColors = {
  ai_job_parsed: "bg-blue-50 border-blue-200",
  ai_candidates_matched: "bg-green-50 border-green-200",
  ai_email_draft_created: "bg-purple-50 border-purple-200",
  ai_email_draft_approved: "bg-green-50 border-green-200",
  ai_email_draft_rejected: "bg-red-50 border-red-200",
  ai_submission_created: "bg-blue-50 border-blue-200",
  ai_task_created: "bg-yellow-50 border-yellow-200",
};

export default function RecruiterActivityTimeline({ runId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [runId]);

  const loadActivities = async () => {
    try {
      const data = await base44.entities.RecruiterActivity.filter(
        { run_id: runId },
        "-created_date",
        50
      );
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading activity...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Activity Timeline</h3>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className={`border rounded-lg p-3 ${activityColors[activity.activity_type] || "bg-gray-50 border-gray-200"}`}>
            <div className="flex gap-3">
              <span className="text-lg" role="img" aria-hidden>
                {activityIcons[activity.activity_type] || "•"}
              </span>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{activity.title}</h4>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                )}

                {/* Metadata */}
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(activity.created_date), "HH:mm")}
              </time>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={loadActivities}
        className="text-xs text-primary hover:underline mt-4"
      >
        Refresh
      </button>
    </Card>
  );
}