import React from "react";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

export default function StatusPath({ items = [], value, onChange, loading = false }) {
  const idx = items.findIndex(i => i.value === value);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-3 min-w-max">
        {items.map((step, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <div key={step.value} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => !loading && onChange?.(step.value)}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                  done ? "bg-green-50 border-green-200 text-green-700" :
                  current ? "bg-blue-50 border-blue-200 text-blue-700" :
                  "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                ].join(" ")}
                title={step.label}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                <span className="text-sm font-medium whitespace-nowrap">{step.label}</span>
              </button>
              {i < items.length - 1 && <ChevronRight className="w-4 h-4 text-slate-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}