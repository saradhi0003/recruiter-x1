import React from "react";
import { X } from "lucide-react";

export default function RightPreviewPanel({ open, title = "", onClose, children, className = "" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[100] pointer-events-auto">
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] md:w-[420px] lg:w-[420px] bg-white border-l border-slate-200 shadow-xl transition-transform duration-200 ease-out ${open ? "translate-x-0" : "translate-x-full"} ${className}`}
        style={{ backdropFilter: "blur(4px)" }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100" aria-label="Close preview">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}