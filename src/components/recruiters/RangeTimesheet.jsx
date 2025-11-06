
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, AlertCircle, Send } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

function fmtISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export default function RangeTimesheet({ onSubmit, leaveRanges = [], existingTimesheets = [] }) {
  const [range, setRange] = React.useState({ from: null, to: null });
  const [hours, setHours] = React.useState({}); // { 'YYYY-MM-DD': '8' }
  const [error, setError] = React.useState("");

  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const isOnLeave = React.useCallback((iso) => {
    if (!iso) return false;
    const d = new Date(iso); d.setHours(0,0,0,0);
    return leaveRanges.some(r => {
      const s = new Date(r.start); s.setHours(0,0,0,0);
      const e = new Date(r.end); e.setHours(0,0,0,0);
      return d >= s && d <= e;
    });
  }, [leaveRanges]);

  const lockedDates = React.useMemo(() => {
    const set = new Set();
    (existingTimesheets || []).forEach(t => {
      const s = String(t.status || "").toLowerCase();
      if (s === "submitted" || s === "approved") set.add(t.date);
    });
    return set;
  }, [existingTimesheets]);

  const daysInRange = React.useMemo(() => {
    const out = [];
    if (!range.from || !range.to) return out;
    const start = new Date(range.from);
    const end = new Date(range.to);
    start.setHours(0,0,0,0); end.setHours(0,0,0,0);
    const cur = new Date(start);
    while (cur <= end) {
      out.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [range]);

  const disabledDay = (date) => {
    const d = new Date(date); d.setHours(0,0,0,0);
    const ms = new Date(monthStart); ms.setHours(0,0,0,0);
    const me = new Date(monthEnd); me.setHours(0,0,0,0);
    if (d < ms || d > me) return true;
    const iso = fmtISO(d);
    // Disable if on leave OR already submitted/approved
    return isOnLeave(iso) || lockedDates.has(iso);
  };

  const total = Object.values(hours).reduce((s, v) => s + (Number(v) || 0), 0);

  const submit = (e) => {
    e?.preventDefault?.();
    if (!range.from || !range.to) {
      setError("Please select a date range first.");
      return;
    }
    const entries = daysInRange
      .map(d => {
        const key = fmtISO(d);
        const h = Number(hours[key] || 0);
        return { date: key, hours: h, status: "submitted" };
      })
      .filter(en => en.hours > 0);

    if (entries.length === 0) {
      setError("Add hours to at least one day.");
      return;
    }
    setError("");
    onSubmit?.(entries);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between flex-row">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-slate-600" />
          <CardTitle className="text-lg">Submit Timesheets by Date Range</CardTitle>
        </div>
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold">{total.toFixed(2)}</span> hrs
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={1}
              defaultMonth={new Date()}
              fromMonth={startOfMonth()}
              toMonth={endOfMonth()}
              disabled={disabledDay}
              className="rounded-md border"
            />
            {/* lock navigation to current month */}
            <div className="text-xs text-slate-600 mt-2">
              Select any date range within this month. Leave dates and already submitted/approved dates are disabled.
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="p-3 rounded-lg border bg-white">
              <div className="text-sm text-slate-700">
                Range:{" "}
                <span className="font-medium">
                  {range.from ? format(range.from, "EEE, MMM d") : "—"}{" "}
                  –{" "}
                  {range.to ? format(range.to, "EEE, MMM d") : "—"}
                </span>
              </div>

              {daysInRange.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {daysInRange.map((d) => {
                    const iso = fmtISO(d);
                    const disabled = isOnLeave(iso) || lockedDates.has(iso);
                    return (
                      <div key={iso} className={`p-2 rounded border ${disabled ? "bg-slate-50 opacity-60" : "bg-white"}`}>
                        <div className="text-xs text-slate-600 mb-1">{format(d, "EEE, MMM d")}</div>
                        <Input
                          type="number"
                          step="0.25"
                          min="0"
                          max="24"
                          value={hours[iso] ?? ""}
                          onChange={(e) => setHours((prev) => ({ ...prev, [iso]: e.target.value }))}
                          placeholder="0.00"
                          disabled={disabled}
                        />
                        {lockedDates.has(iso) && (
                          <div className="text-[10px] text-slate-500 mt-1">Already submitted</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-500 mt-3">Pick a date range on the calendar.</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setRange({ from: null, to: null }); setHours({}); }}>
                Clear
              </Button>
              <Button type="submit" className="gap-2">
                <Send className="w-4 h-4" />
                Submit for Approval
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
