import React from "react";
import { Badge } from "@/components/ui/badge";

export default function MobileTaskItem({ task, onComplete }) {
  const overdue = task.due_date && (new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0));
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-white">
      <input
        type="checkbox"
        className="mt-1"
        checked={task.status === "completed"}
        onChange={() => onComplete?.(task)}
        title="Mark complete"
      />
      <div className="flex-1">
        <p className={`font-medium text-slate-900 ${overdue ? "text-red-600" : ""}`}>{task.title}</p>
        <div className="text-xs text-slate-600 flex flex-wrap gap-2">
          {task.priority && <Badge variant="secondary" className="capitalize">{task.priority}</Badge>}
          {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
}