import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-slate-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-8 w-8 bg-slate-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex gap-4">
          {[...Array(cols)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded flex-1 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-200">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-4">
              {[...Array(cols)].map((_, j) => (
                <div key={j} className="h-4 bg-slate-200 rounded flex-1 animate-pulse" style={{ animationDelay: `${j * 100}ms` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-8 bg-slate-200 rounded w-1/3" />
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}