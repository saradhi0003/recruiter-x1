import React from "react";
import PublicNav from "@/components/site/PublicNav";
import PublicFooter from "@/components/site/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  { title: "Permanent Staffing", points: ["Executive search", "Direct hire", "Diversity sourcing"] },
  { title: "Contract & Temp", points: ["On-demand talent", "Contract-to-hire", "Coverage staffing"] },
  { title: "RPO Programs", points: ["Embedded recruiters", "SLA-driven pipelines", "Analytics & reporting"] },
  { title: "Tech Recruitment", points: ["Engineering", "Data & AI", "Cloud/DevOps/SRE"] },
  { title: "Non-Tech Recruitment", points: ["Sales & CS", "Finance & Ops", "HR & Legal"] },
  { title: "Advisory", points: ["Comp & leveling", "Employer brand", "Process design"] },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <section className="pt-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">Staffing & Recruiting Services</h1>
          <p className="mt-4 text-slate-600 text-lg">Full-cycle talent solutions tailored to your growth.</p>
        </div>

        <div className="mx-auto max-w-7xl px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <Card key={i} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <h3 className="font-medium text-slate-900">{s.title}</h3>
                <ul className="mt-3 text-sm text-slate-600 space-y-2">
                  {s.points.map((p, idx) => <li key={idx}>• {p}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}