
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Send, AlertCircle } from "lucide-react";

function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // start on Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function WeeklyTimesheet({ onSubmit, leaveRanges = [] }) {
  const start = getStartOfWeek();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const [hours, setHours] = React.useState(() =>
    Object.fromEntries(days.map((d) => [formatISODate(d), ""]))
  );
  const [error, setError] = React.useState("");

  const total = Object.values(hours).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const isOnLeave = (iso) => {
    if (!iso) return false;
    const d = new Date(iso); d.setHours(0,0,0,0);
    return leaveRanges.some(r => {
      const s = new Date(r.start); s.setHours(0,0,0,0);
      const e = new Date(r.end); e.setHours(0,0,0,0);
      return d >= s && d <= e;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const entries = Object.entries(hours)
      .filter(([, v]) => Number(v) > 0)
      .map(([date, v]) => ({ date, hours: Number(v), status: "submitted" }));

    const invalid = entries.filter(en => isOnLeave(en.date));
    if (invalid.length > 0) {
      setError("You cannot submit hours on dates you have applied leave for.");
      return;
    }
    setError("");
    onSubmit?.(entries);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between flex-row">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-slate-600" />
          <CardTitle className="text-lg">This Week Timesheet</CardTitle>
        </div>
        <div className="text-sm text-slate-600">Total: <span className="font-semibold">{total.toFixed(2)}</span> hrs</div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {days.map((d) => {
            const key = formatISODate(d);
            const label = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
            const leaveDay = isOnLeave(key);
            return (
              <div key={key} className={`p-3 border rounded-lg ${leaveDay ? "bg-red-50 border-red-200" : "bg-white"}`}>
                <div className={`text-xs mb-1 ${leaveDay ? "text-red-600" : "text-slate-500"}`}>{label}{leaveDay ? " • Leave" : ""}</div>
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={hours[key]}
                  onChange={(e) =>
                    setHours((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder="0.00"
                  disabled={leaveDay}
                />
              </div>
            );
          })}
          <div className="md:col-span-7 flex justify-end">
            <Button type="submit" className="gap-2">
              <Send className="w-4 h-4" />
              Submit for Approval
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
