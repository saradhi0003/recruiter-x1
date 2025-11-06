import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Globe, Phone, Mail } from "lucide-react";
import { Company } from "@/entities/Company";

export default function CompanyPreview({ id }) {
  const [company, setCompany] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await Company.filter({ id }, "-created_date", 1);
      if (!mounted) return;
      setCompany(res?.[0] || null);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!company) return <div className="flex items-center justify-center h-24 text-slate-600"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading connection…</div>;

  const primary = (company.contacts || []).find(c => c.is_primary) || company.contacts?.[0];

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-2">
        <h2 className="font-semibold text-slate-900">{company.name}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">{company.status}</Badge>
          <Badge className="bg-indigo-100 text-indigo-800 capitalize">{company.type}</Badge>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-2 text-sm">
        {company.location && <div className="flex items-center gap-2 text-slate-700"><MapPin className="w-4 h-4 text-slate-400" /> {company.location}</div>}
        {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800"><Globe className="w-4 h-4" /> {company.website}</a>}
        {primary?.email && <div className="flex items-center gap-2 text-slate-700"><Mail className="w-4 h-4 text-slate-400" /> {primary.email}</div>}
        {primary?.phone && <div className="flex items-center gap-2 text-slate-700"><Phone className="w-4 h-4 text-slate-400" /> {primary.phone}</div>}
      </CardContent></Card>
    </div>
  );
}