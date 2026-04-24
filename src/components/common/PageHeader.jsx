import React from "react";

export default function PageHeader({ title, subtitle, right = null, className = "" }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] ${className}`}>
      <div>
        <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-[#64748B] mt-0.5">{subtitle}</p>
        )}
      </div>
      {right && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {right}
        </div>
      )}
    </div>
  );
}