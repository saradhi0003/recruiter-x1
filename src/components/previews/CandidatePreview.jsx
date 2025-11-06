import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, ExternalLink, Edit, ArrowUpRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Candidate } from "@/entities/Candidate";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const statusOptions = [
  { value: "our_bench", label: "Our Bench" },
  { value: "active", label: "Active" },
  { value: "placed", label: "Placed" },
  { value: "inactive", label: "Inactive" },
  { value: "do_not_contact", label: "Do Not Contact" }
];

const getStatusBadge = (s) => {
  switch ((s || "").toLowerCase()) {
    case "our_bench": return "bg-purple-100 text-purple-800";
    case "active": return "bg-green-100 text-green-800";
    case "placed": return "bg-blue-100 text-blue-800";
    case "inactive": return "bg-slate-100 text-slate-800";
    case "do_not_contact": return "bg-red-100 text-red-800";
    default: return "bg-slate-100 text-slate-700";
  }
};

export default function CandidatePreview({ candidate, onUpdated }) {
  const [updating, setUpdating] = React.useState(false);
  const [status, setStatus] = React.useState(candidate.status);

  React.useEffect(() => setStatus(candidate.status), [candidate.status]);

  const updateStatus = async (val) => {
    if (!val || val === status) return;
    setUpdating(true);
    await Candidate.update(candidate.id, { status: val });
    setUpdating(false);
    setStatus(val);
    onUpdated?.();
  };

  const initials = `${(candidate.first_name || "?").charAt(0)}${(candidate.last_name || "").charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-900 truncate">
                  {candidate.first_name} {candidate.last_name}
                </h2>
                <a
                  href={createPageUrl(`CandidateDetails?id=${candidate.id}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-slate-700"
                  title="Open details in a new tab"
                  data-no-preview="true"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
              <p className="text-sm text-slate-600">{candidate.current_title || "Not specified"}</p>
            </div>

            {/* Edit goes to the actual edit screen; mark with data-intent to bypass preview */}
            <Link
              to={createPageUrl(`CandidateDetails?id=${candidate.id}&edit=true`)}
              data-intent="edit"
              className="ml-auto inline-flex items-center gap-2 border rounded-md px-2.5 py-1.5 text-sm hover:bg-slate-50"
              title="Edit candidate"
            >
              <Edit className="w-4 h-4" /> Edit
            </Link>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            {candidate.email && (
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-500" /> {candidate.email}
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-500" /> {candidate.phone}
              </div>
            )}
            {(candidate.location) && (
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-500" /> {candidate.location}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Status + inline edit */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">Current Status</p>
            <Badge className={`${getStatusBadge(status)} capitalize`}>{status || "unknown"}</Badge>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Update Status</p>
            <Select
              value={status}
              onValueChange={updateStatus}
              disabled={updating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Change status..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}