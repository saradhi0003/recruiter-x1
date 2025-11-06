
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function DataListModal({ open, title, columns = [], rows = [], onClose }) {
  const [q, setQ] = React.useState("");
  // compute filtered BEFORE any early return to keep hooks order valid
  const filtered = React.useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter(r => Object.values(r).some(v => String(v ?? "").toLowerCase().includes(needle)));
  }, [q, rows]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-5xl max-h-[85vh] overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <Button aria-label="Close" variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 text-red-600 hover:text-red-700">
          <X className="w-5 h-5" />
        </Button>
        <CardHeader className="flex flex-row items-center justify-between pr-12">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">Showing {filtered.length} of {rows.length}</div>
          </div>

          <div className="overflow-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    {columns.map(c => (
                      <td key={c.key} className="px-4 py-3 whitespace-nowrap">{r[c.key] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={columns.length}>
                      No results
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
