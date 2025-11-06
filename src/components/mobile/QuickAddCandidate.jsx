import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { Candidate } from "@/entities/Candidate";

export default function QuickAddCandidate({ open, onClose, onCreated }) {
  const [data, setData] = React.useState({ first_name: "", last_name: "", email: "" });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setData({ first_name: "", last_name: "", email: "" });
  }, [open]);

  if (!open) return null;

  const save = async () => {
    setSaving(true);
    await Candidate.create({ ...data, status: "active" });
    setSaving(false);
    onCreated?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <Card className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="text-base">Quick Add Candidate</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>First Name</Label>
            <Input value={data.first_name} onChange={(e) => setData({ ...data, first_name: e.target.value })} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={data.last_name} onChange={(e) => setData({ ...data, last_name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
          </div>
          <Button className="w-full gap-2" onClick={save} disabled={saving || !data.first_name || !data.last_name || !data.email}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}