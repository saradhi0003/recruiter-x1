import React from "react";
import { Company, Job } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, ExternalLink } from "lucide-react";

export default function CompanyDetailsPage() {
  const [company, setCompany] = React.useState(null);
  const [jobs, setJobs] = React.useState([]);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) return;
    const load = async () => {
      const rec = await Company.get(id);
      setCompany(rec);
      const openJobs = await Job.filter({ company_id: id, status: "open" }, "-created_date");
      setJobs(openJobs);
    };
    load();
  }, []);

  if (!company) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-slate-700" />
          <CardTitle className="text-2xl">{company.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">{company.industry || "Industry —"}</Badge>
            <Badge>{company.status}</Badge>
            {company.location && <span className="text-slate-700">• {company.location}</span>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 inline-flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Website
              </a>
            )}
          </div>
          {company.description && <p className="text-slate-700">{company.description}</p>}
          {Array.isArray(company.contacts) && company.contacts.length > 0 && (
            <div>
              <p className="font-medium mb-1">Contacts</p>
              <div className="space-y-2">
                {company.contacts.map((c, i) => (
                  <div key={i} className="text-sm text-slate-700">
                    <span className="font-medium">{c.name}</span>
                    {c.title && <span> — {c.title}</span>}
                    {c.email && <span> • {c.email}</span>}
                    {c.phone && <span> • {c.phone}</span>}
                    {c.is_primary && <Badge className="ml-2">Primary</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-slate-700" />
          <CardTitle>Open Jobs ({jobs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {jobs.length === 0 ? (
            <div className="text-slate-600 text-sm">No open jobs.</div>
          ) : (
            <ul className="list-disc pl-6">
              {jobs.map(j => (
                <li key={j.id} className="text-sm">{j.title} • {j.location || "—"}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}