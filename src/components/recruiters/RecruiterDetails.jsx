
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Mail, Phone, MapPin, Trash } from "lucide-react"; // Added Trash

export default function RecruiterDetails({ recruiter, onClose, onDelete }) { // Added onDelete prop
  if (!recruiter) return null;
  const statusBadge = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    on_leave: "bg-yellow-100 text-yellow-800"
  }[recruiter.status] || "bg-gray-100 text-gray-800";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{recruiter.first_name} {recruiter.last_name}</h2>
            <Badge variant="secondary" className="capitalize">{recruiter.role}</Badge>
            <Badge className={statusBadge}>{recruiter.status}</Badge>
          </div>
          <div className="flex items-center gap-1"> {/* New wrapper div for buttons */}
            {onDelete && (
              <Button variant="ghost" size="icon" title="Delete and transfer" onClick={onDelete}>
                <Trash className="w-5 h-5 text-red-600" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-700"><Mail className="w-4 h-4" /> {recruiter.email}</div>
          {recruiter.phone && <div className="flex items-center gap-2 text-slate-700"><Phone className="w-4 h-4" /> {recruiter.phone}</div>}
          {recruiter.territory && <div className="flex items-center gap-2 text-slate-700"><MapPin className="w-4 h-4" /> {recruiter.territory}</div>}
          {Array.isArray(recruiter.specializations) && recruiter.specializations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recruiter.specializations.map((s,i)=><Badge key={i} variant="outline">{s}</Badge>)}
            </div>
          )}
          {recruiter.notes && <div className="text-slate-700 whitespace-pre-wrap">{recruiter.notes}</div>}
        </div>
      </div>
    </div>
  );
}
