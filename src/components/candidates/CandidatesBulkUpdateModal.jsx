
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { Candidate } from "@/entities/all";

export default function CandidatesBulkUpdateModal({ open, onClose, selectedIds = [], onUpdated }) {
  const [status, setStatus] = React.useState("");
  const [availability, setAvailability] = React.useState("");
  const [workAuth, setWorkAuth] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setStatus("");
      setAvailability("");
      setWorkAuth("");
      setSaving(false);
    }
  }, [open]);

  const apply = async () => {
    const payload = {};
    if (status) payload.status = status;
    if (availability) payload.availability = availability;
    if (workAuth) payload.work_authorization = workAuth;
    if (Object.keys(payload).length === 0) {
      onClose?.();
      return;
    }
    setSaving(true);
    await Promise.all(selectedIds.map(id => Candidate.update(id, payload)));
    setSaving(false);
    onClose?.();
    onUpdated?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => onClose?.()}>
      <Card className="w-full max-w-lg" onClick={(e)=>e.stopPropagation()}>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Mass Update Candidates</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onClose?.()}><X className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Applying to {selectedIds.length} selected candidate(s).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Leave unchanged" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="our_bench">Our Bench</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Availability</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger><SelectValue placeholder="Leave unchanged" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediately</SelectItem>
                  <SelectItem value="2_weeks">2 Weeks</SelectItem>
                  <SelectItem value="1_month">1 Month</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Work Authorization</label>
              <Select value={workAuth} onValueChange={setWorkAuth}>
                <SelectTrigger><SelectValue placeholder="Leave unchanged" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">US Citizen</SelectItem>
                  <SelectItem value="permanent_resident">Permanent Resident</SelectItem>
                  <SelectItem value="h1b">H1B</SelectItem>
                  <SelectItem value="opt">OPT</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onClose?.()}>Cancel</Button>
            <Button onClick={apply} disabled={saving} className="gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Apply Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
