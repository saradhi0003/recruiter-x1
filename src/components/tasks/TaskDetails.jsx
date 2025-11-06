import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, User, Link as LinkIcon, Edit } from "lucide-react";

export default function TaskDetails({ task, onClose, onEdit }) {
  if (!task) return null;

  const statusColor = {
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  }[task.status] || "bg-gray-100 text-gray-800";

  const priorityColor = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  }[task.priority] || "bg-yellow-100 text-yellow-800";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-auto" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <div className="flex gap-2">
              <Badge className={statusColor} >{String(task.status).replace("_"," ")}</Badge>
              <Badge className={priorityColor}>{task.priority}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={()=>onEdit?.(task)} className="gap-2"><Edit className="w-4 h-4" /> Edit</Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {task.assigned_to && (
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4" /> Assigned to: <span className="font-medium">{task.assigned_to}</span>
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4" /> Due: <span className="font-medium">{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
          {(task.related_entity || task.related_id) && (
            <div className="flex items-center gap-2 text-slate-700">
              <LinkIcon className="w-4 h-4" /> Related: <span className="font-medium">{task.related_entity || "—"}</span> {task.related_id && <span>• {task.related_id}</span>}
            </div>
          )}
          {task.description && (
            <div>
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          {Array.isArray(task.tags) && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((t,i)=><Badge key={i} variant="outline">{t}</Badge>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}