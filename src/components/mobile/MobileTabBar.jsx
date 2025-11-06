import React from "react";
import { Home, Users, Briefcase, CheckSquare } from "lucide-react";

const tabs = [
  { key: "home", label: "Home", icon: Home },
  { key: "candidates", label: "Candidates", icon: Users },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
];

export default function MobileTabBar({ value, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t z-40">
      <div className="grid grid-cols-4">
        {tabs.map(t => {
          const ActiveIcon = t.icon;
          const active = value === t.key;
          return (
            <button
              key={t.key}
              className={`py-2 flex flex-col items-center text-xs ${active ? "text-blue-600" : "text-slate-600"}`}
              onClick={() => onChange?.(t.key)}
            >
              <ActiveIcon className="w-5 h-5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}