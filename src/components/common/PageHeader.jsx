import React from "react";

export default function PageHeader({ title, subtitle, right = null, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: "linear-gradient(90deg, var(--brand-cyan), var(--brand-blue), var(--brand-purple))",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
      }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="text-white">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="opacity-90">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 text-slate-900">
          {right}
        </div>
      </div>
    </div>
  );
}