import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs({ items = [] }) {
  const allItems = [
    { label: "Home", url: "Dashboard", icon: Home },
    ...items
  ];

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-600 mb-4">
      {allItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
          {index === allItems.length - 1 ? (
            <span className="font-medium text-slate-900 flex items-center gap-1">
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </span>
          ) : (
            <Link
              to={createPageUrl(item.url)}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}