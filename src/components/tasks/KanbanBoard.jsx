import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskKanbanCard from "./TaskKanbanCard";
import { Badge } from "@/components/ui/badge";

export default function KanbanBoard({ columns = [], tasks = [], onDragEnd, onCardClick }) {
  const grouped = React.useMemo(() => {
    const map = Object.fromEntries(columns.map(c => [c, []]));
    tasks.forEach(t => {
      const col = columns.includes(t.status) ? t.status : columns[0];
      map[col].push(t);
    });
    return map;
  }, [columns, tasks]);

  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((colId) => (
          <Droppable droppableId={colId} key={colId}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">{statusLabels[colId] || colId}</h3>
                  <Badge variant="secondary" className="text-xs">{grouped[colId]?.length || 0}</Badge>
                </div>
                <div className="space-y-3">
                  {(grouped[colId] || []).map((t, i) => (
                    <Draggable draggableId={t.id} index={i} key={t.id}>
                      {(drag) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                          <TaskKanbanCard task={t} onClick={() => onCardClick?.(t)} />
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