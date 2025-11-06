import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Tag, Link as LinkIcon } from "lucide-react";
import { Task } from "@/entities/Task";

export default function TaskPreview({ id }) {
  const [task, setTask] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await Task.filter({ id }, "-created_date", 1);
      if (!mounted) return;
      setTask(r?.[0] || null);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!task) return <div className="flex items-center justify-center h-24 text-slate-600"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading task…</div>;

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-2">
        <h2 className="font-semibold text-slate-900">{task.title}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">{task.status}</Badge>
          <Badge className="bg-amber-100 text-amber-800 capitalize">{task.priority}</Badge>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-2 text-sm">
        {task.due_date && <div className="flex items-center gap-2 text-slate-700"><Calendar className="w-4 h-4 text-slate-400" /> Due: {new Date(task.due_date).toLocaleDateString()}</div>}
        {task.related_entity && <div className="flex items-center gap-2 text-slate-700"><LinkIcon className="w-4 h-4 text-slate-400" /> Related: {task.related_entity}</div>}
        {Array.isArray(task.tags) && task.tags.length > 0 && (
          <div className="flex items-center gap-2 text-slate-700">
            <Tag className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-1">{task.tags.map((t,i)=> <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}</div>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}