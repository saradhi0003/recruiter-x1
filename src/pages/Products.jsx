import React from "react";
import PublicNav from "@/components/site/PublicNav";
import PublicFooter from "@/components/site/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Briefcase, Globe, ShieldCheck, Zap } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Candidate CRM", desc: "Rich profiles, AI summaries, and powerful search." },
  { icon: Briefcase, title: "Jobs & Pipelines", desc: "Visual kanban to track submissions and interviews." },
  { icon: Globe, title: "Email & Integrations", desc: "Templates and integrations for automated outreach." },
  { icon: Sparkles, title: "AI Assistance", desc: "Bulk ranking, summaries, and context-aware prompts." },
  { icon: ShieldCheck, title: "Access Control", desc: "Granular role-based permissions and approvals." },
  { icon: Zap, title: "Performance", desc: "Clean, fast UI that scales with your team." },
];

export default function Products() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <section className="pt-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
            Our Products
          </h1>
          <p className="mt-4 text-slate-600 text-lg">
            A modern recruiting platform built for speed, clarity, and collaboration.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <Card key={i} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-slate-900">{f.title}</h3>
                <p className="text-slate-600 mt-2 text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}