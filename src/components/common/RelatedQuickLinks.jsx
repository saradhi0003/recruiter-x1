import React from "react";
import { Button } from "@/components/ui/button";

export default function RelatedQuickLinks({ items = [] }) {
  // Dedupe by id to avoid accidental duplicates
  const uniq = React.useMemo(() => {
    const map = new Map();
    (items || []).forEach((it) => {
      if (!map.has(it.id)) map.set(it.id, it);
    });
    return Array.from(map.values());
  }, [items]);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-wrap gap-3 bg-white border rounded-xl p-3">
      {uniq.map((it) => (
        <Button
          key={it.id}
          variant="outline"
          className="bg-white hover:bg-slate-50"
          onClick={() => goTo(it.id)}
        >
          {it.label}
          <span className="ml-2 inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-slate-100 text-slate-700 text-xs">
            {typeof it.count === "number" ? it.count : 0}
          </span>
        </Button>
      ))}
    </div>
  );
}