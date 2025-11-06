import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

export default function TaskKanbanCard({ task, onClick }) {
  const statusColors = {
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };
  const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  return (
    <Card className="shadow-sm hover:shadow-md transition cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <p className={`font-semibold text-slate-900 truncate ${task.status === "completed" ? "line-through text-slate-500" : ""}`}>
              {task.title}
            </p>
            {task.assigned_to && (
              <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assigned_to}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={statusColors[task.status] || statusColors.pending}>{task.status?.replace("_"," ")}</Badge>
            <Badge className={priorityColors[task.priority] || priorityColors.medium}>{task.priority}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {task.due_date && (
          <div className={`flex items-center gap-2 text-xs ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
            <Calendar className="w-3 h-3" />
            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
        {task.related_entity && (
          <p className="text-xs text-slate-500">Related: {task.related_entity}</p>
        )}
      </CardContent>
    </Card>
  );
}