import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, MapPin, Briefcase, Calendar, ExternalLink, Edit, Sparkles, RefreshCw } from "lucide-react";
import { Job } from "@/entities/Job";
import { Company } from "@/entities/Company";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function JobPreview({ id }) {
  const [job, setJob] = React.useState(null);
  const [company, setCompany] = React.useState(null);
  const [aiSummary, setAiSummary] = React.useState(null);
  const [loadingSummary, setLoadingSummary] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await Job.filter({ id }, "-created_date", 1);
      const j = res?.[0] || null;
      if (!mounted) return;
      setJob(j);
      if (j?.company_id) {
        const co = await Company.filter({ id: j.company_id }, "-created_date", 1).catch(()=>[]);
        if (mounted) setCompany(co?.[0] || null);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const generateAISummary = async () => {
    if (!job || loadingSummary) return;
    
    setLoadingSummary(true);
    try {
      const prompt = `Generate a concise, professional AI summary for this job posting. Focus on:
1. Key role highlights (2-3 sentences)
2. Must-have qualifications
3. What makes this opportunity attractive
4. Ideal candidate profile

Job Details:
- Title: ${job.title}
- Company: ${company?.name || 'N/A'}
- Location: ${job.location || 'Not specified'}
- Remote Type: ${job.remote_type || 'Not specified'}
- Employment Type: ${job.employment_type || 'Not specified'}
- Rate/Salary: ${job.rate || 'Not specified'}
- Experience Required: ${job.experience_required ? `${job.experience_required}+ years` : 'Not specified'}
- Description: ${job.description || 'N/A'}
- Requirements: ${job.requirements || 'N/A'}
- Required Skills: ${job.required_skills?.join(', ') || 'N/A'}
- Preferred Skills: ${job.preferred_skills?.join(', ') || 'N/A'}

Provide a compelling 3-4 paragraph summary that would help recruiters quickly understand the role and identify suitable candidates.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAiSummary(typeof response === 'string' ? response : JSON.stringify(response));
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setAiSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  React.useEffect(() => {
    if (job && !aiSummary && !loadingSummary) {
      generateAISummary();
    }
  }, [job]);

  if (!job) return <div className="flex items-center justify-center h-24 text-slate-600"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading job…</div>;

  return (
    <div className="space-y-4">
      {/* Quick edit button */}
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm" className="gap-2" data-intent="edit">
          <Link to={createPageUrl(`JobDetails?id=${job.id}&edit=true`)}>
            <Edit className="w-4 h-4" /> Edit
          </Link>
        </Button>
      </div>

      <Card><CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700"><Briefcase className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900 truncate">{job.title}</h2>
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" /> {company?.name || "—"}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="capitalize">{job.status}</Badge>
          {job.priority && <Badge className="bg-amber-100 text-amber-800 capitalize">{job.priority}</Badge>}
          {job.remote_type && <Badge variant="outline" className="capitalize">{job.remote_type}</Badge>}
        </div>
      </CardContent></Card>

      {/* AI Summary Section */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">AI Summary</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateAISummary}
              disabled={loadingSummary}
              className="h-8 gap-1 text-purple-700 hover:text-purple-900"
            >
              <RefreshCw className={`w-3 h-3 ${loadingSummary ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {loadingSummary ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
              <span className="text-sm text-purple-700">Generating AI summary...</span>
            </div>
          ) : aiSummary ? (
            <div className="text-sm text-slate-700 space-y-2 whitespace-pre-wrap">
              {aiSummary}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic py-4 text-center">
              Click refresh to generate AI summary
            </div>
          )}
        </CardContent>
      </Card>

      <Card><CardContent className="p-4 space-y-2 text-sm">
        {job.location && <div className="flex items-center gap-2 text-slate-700"><MapPin className="w-4 h-4 text-slate-400" /> {job.location}</div>}
        {job.due_date && <div className="flex items-center gap-2 text-slate-700"><Calendar className="w-4 h-4 text-slate-400" /> Target: {new Date(job.due_date).toLocaleDateString()}</div>}
        {company?.website && (
          <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ExternalLink className="w-4 h-4" /> Company Site
          </a>
        )}
      </CardContent></Card>

      {Array.isArray(job.required_skills) && job.required_skills.length > 0 && (
        <Card><CardContent className="p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {job.required_skills.slice(0, 12).map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}