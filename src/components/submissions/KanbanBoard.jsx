import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SubmissionKanbanCard from "./SubmissionKanbanCard";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { executeAutomationRules } from "@/components/automation/executeAutomation";

export default function KanbanBoard({
  submissions = [],
  candidates = [],
  jobs = [],
  onSubmissionClick,
  onRefresh
}) {
  const columns = ["submitted", "under_review", "interviewing", "rejected", "hired", "withdrawn"];
  
  const candMap = React.useMemo(() => Object.fromEntries(candidates.map(c => [c.id, c])), [candidates]);
  const jobMap = React.useMemo(() => Object.fromEntries(jobs.map(j => [j.id, j])), [jobs]);

  // Group submissions by status
  const grouped = React.useMemo(() => {
    const map = Object.fromEntries(columns.map(c => [c, []]));
    submissions.forEach(s => {
      const col = columns.includes(s.status) ? s.status : "submitted";
      map[col].push(s);
    });
    return map;
  }, [submissions]);

  const statusLabels = {
    submitted: "Submitted",
    under_review: "Under Review",
    interviewing: "Interviewing",
    rejected: "Rejected",
    hired: "Hired",
    withdrawn: "Withdrawn"
  };

  const handleDragEnd = async (result) => {
    if (!result?.destination) return;
    const { draggableId, destination } = result;
    const destStatus = destination.droppableId;
    if (!destStatus) return;

    try {
      // Get old data before update
      const oldSubmission = submissions.find(s => s.id === draggableId);
      if (!oldSubmission) return;

      // Update submission
      await base44.entities.Submission.update(draggableId, { status: destStatus });
      
      // Execute automation rules
      const newData = { ...oldSubmission, status: destStatus };
      executeAutomationRules("Submission", draggableId, oldSubmission, newData).catch(err => {
        console.warn("Automation execution failed:", err);
      });
      
      if (onRefresh) onRefresh();
    } catch (e) {
      console.warn("Kanban drag update failed:", e);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {columns.map((colId) => (
          <Droppable droppableId={colId} key={colId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[200px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {statusLabels[colId] || colId}
                  </h3>
                  <Badge variant="secondary" className="text-xs">{grouped[colId]?.length || 0}</Badge>
                </div>
                <div className="space-y-3">
                  {(grouped[colId] || []).map((s, i) => (
                    <Draggable draggableId={s.id} index={i} key={s.id}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                        >
                          <SubmissionKanbanCard
                            submission={s}
                            candidate={candMap[s.candidate_id]}
                            job={jobMap[s.job_id]}
                            onClick={() => onSubmissionClick?.(s)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}