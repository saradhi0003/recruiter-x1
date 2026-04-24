import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Save, FileText, Grid3x3, Sparkles, Target, Lightbulb } from "lucide-react"; // Added Lightbulb
import { base44 } from "@/api/base44Client";
import ResumeFormLeft from "../components/resume/ResumeFormLeft";
import ResumePreview from "../components/resume/ResumePreview";
import ResumeScorer from "../components/resume/ResumeScorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/common/Breadcrumbs";

// Import Skill Matrix components
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Filter,
  TrendingUp,
  Search,
  CheckCircle,
  AlertCircle,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// New imports for AI components
import ResumeAIAssistant from "../components/resume/ResumeAIAssistant";
import CandidateAIEnrichment from "../components/candidates/CandidateAIEnrichment";

export default function ResumeStudio() {
  // Resume Studio state
  const [candidates, setCandidates] = useState([]);
  const [data, setData] = useState({
    name: "John Doe",
    headline: "Software engineer obsessed with building exceptional products that people love",
    email: "hello@example.com",
    phone: "123-456-7890",
    location: "NYC, NY",
    linkedin: "linkedin.com/in/johndoe",
    summary: "",
    experiences: [],
    education: [],
    projects: [],
    skills: [],
    theme_color: "#3b82f6"
  });
  const [zoom, setZoom] = useState(0.72);
  const [autoscale, setAutoscale] = useState(true);
  const [candidatesLoaded, setCandidatesLoaded] = useState(false);
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const loadingRef = useRef({ ts: 0, inFlight: false });

  // Skill Matrix state
  const [jobs, setJobs] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [matrixData, setMatrixData] = useState(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("matrix");
  const [proficiencyFilter, setProficiencyFilter] = useState("all");

  // New state for skill matrix enhancements
  const [skillGapExplanations, setSkillGapExplanations] = useState(null);
  const [hypotheticalProfile, setHypotheticalProfile] = useState(null);
  const [upskillingRecommendations, setUpskillingRecommendations] = useState(null);
  const [generatingEnhancements, setGeneratingEnhancements] = useState(false); // This state variable is declared but not yet used.

  // Unified state
  const [activeTab, setActiveTab] = useState("resume-build");

  const loadCandidatesIfNeeded = async () => {
    if (candidatesLoaded || loadingRef.current.inFlight) return;
    
    const now = Date.now();
    if (now - loadingRef.current.ts < 30000) return;
    
    loadingRef.current.inFlight = true;
    loadingRef.current.ts = now;

    try {
      const cached = sessionStorage.getItem('resume_studio_candidates');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.ts && now - parsed.ts < 5 * 60 * 1000) {
          setCandidates(parsed.data || []);
          setCandidatesLoaded(true);
          loadingRef.current.inFlight = false;
          return;
        }
      }

      const cands = await base44.entities.Candidate.list("-updated_date", 25);
      setCandidates(cands || []);
      setCandidatesLoaded(true);
      
      sessionStorage.setItem('resume_studio_candidates', JSON.stringify({
        ts: now,
        data: cands || []
      }));
    } catch (error) {
      console.warn("Failed to load candidates for Resume Studio:", error);
      setCandidates([]);
      setCandidatesLoaded(true);
    } finally {
      loadingRef.current.inFlight = false;
    }
  };

  const loadSkillMatrixData = async () => {
    setMatrixLoading(true);
    try {
      const [jobsData, candidatesData] = await Promise.all([
        base44.entities.Job.filter({ status: "open" }, "-created_date", 100),
        base44.entities.Candidate.filter({ status: "active" }, "-updated_date", 300)
      ]);
      setJobs(jobsData || []);
      setAllCandidates(candidatesData || []);
    } catch (error) {
      console.error("Error loading skill matrix data:", error);
    }
    setMatrixLoading(false);
  };

  useEffect(() => {
    if (activeTab === "resume-build") {
      loadCandidatesIfNeeded();
    } else if (activeTab === "skill-matrix") {
      if (jobs.length === 0) {
        loadSkillMatrixData();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (!autoscale) return;
    let obs;
    const resize = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - 24;
      const baseWidth = 816;
      const s = Math.max(0.4, Math.min(1.1, available / baseWidth));
      setZoom(Number(s.toFixed(2)));
    };
    resize();
    obs = new ResizeObserver(resize);
    if (containerRef.current) {
      obs.observe(containerRef.current);
    }
    return () => {
      if (obs) obs.disconnect();
    };
  }, [autoscale]);

  const saveResume = async () => {
    if (data.id) {
      await base44.entities.Resume.update(data.id, data);
    } else {
      const created = await base44.entities.Resume.create(data);
      setData(prev => ({ ...prev, id: created.id }));
    }
    alert("Resume saved.");
  };

  const downloadPDF = () => {
    const html = previewRef.current?.outerHTML;
    if (!html) return;
    const w = window.open("", "PRINT", "width=900,height=1200");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Resume</title>
          <style>
            @page { size: letter; margin: 0; }
            body { margin: 0; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  };

  // Skill Matrix functions
  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const analyzeSkillMatrix = async () => {
    if (selectedJobs.length === 0) {
      alert("Please select at least one job to analyze");
      return;
    }

    setAnalyzing(true);
    try {
      const selectedJobDetails = jobs.filter(j => selectedJobs.includes(j.id));

      const jobsContext = selectedJobDetails.map(job => `
**Job: ${job.title}**
- Description: ${job.description || 'N/A'}
- Required Skills: ${(job.required_skills || []).join(', ')}
- Preferred Skills: ${(job.preferred_skills || []).join(', ')}
- Requirements: ${job.requirements || 'N/A'}
- Experience Required: ${job.experience_required || 'N/A'} years
      `).join('\n---\n');

      const candidatesContext = allCandidates.map(c => `
**Candidate: ${c.first_name} ${c.last_name}**
- Current Title: ${c.current_title || 'N/A'}
- Experience: ${c.experience_years || 0} years
- Skills: ${(c.skills || []).join(', ')}
- Additional Experience: ${c.addedExperience || 'N/A'}
- Real-time Experience: ${c.realTimeExperience || 'N/A'}
- Location: ${c.location || 'N/A'}
- Work Auth: ${c.work_authorization || 'N/A'}
      `).join('\n---\n');

      const prompt = `You are an expert technical recruiter analyzing skill requirements and candidate proficiencies using advanced AI techniques:

**ENHANCED ANALYSIS WITH:**
1. Automatic skill extraction and normalization (React.js = ReactJS = React)
2. Semantic matching using ESCO/ONET taxonomies
3. Skill gap explanations with actionable insights
4. Hypothetical "ideal candidate" profile generation
5. Upskilling recommendations based on identified gaps

**JOBS TO ANALYZE:**
${jobsContext}

**CANDIDATES TO EVALUATE:**
${candidatesContext}

**YOUR COMPREHENSIVE TASK:**

**PART 1: SKILL EXTRACTION & NORMALIZATION**
Extract all technical skills from job descriptions and candidate profiles, then normalize them:
- Group synonyms (React.js, ReactJS, React → "React")
- Standardize naming conventions
- Map to ESCO/ONET categories where applicable
- Identify skill relationships (e.g., Next.js requires React)

**PART 2: CANDIDATE PROFICIENCY SCORING (0-100)**
For each candidate and each skill:
- 90-100: Expert (deep experience, recent use, senior-level work)
- 70-89: Proficient (solid experience, regular use)
- 50-69: Intermediate (some experience, learning or past use)
- 30-49: Beginner (minimal experience, needs training)
- 0-29: No evidence

Consider: recency, seniority, related technologies, project complexity

**PART 3: SKILL GAP EXPLANATIONS**
For each skill gap identified, provide:
- Why this gap matters for the role
- How critical it is (blocking vs nice-to-have)
- Estimated learning time (weeks/months)
- Recommended learning path
- Related skills the candidate already has that will help

**PART 4: HYPOTHETICAL IDEAL CANDIDATE PROFILE**
Generate a detailed profile of the "perfect candidate" for these roles:
- Must-have skills with proficiency levels
- Years of experience needed
- Domain expertise required
- Soft skills indicators
- Education/certifications
- This serves as a benchmark for sourcing

**PART 5: UPSKILLING RECOMMENDATIONS**
For candidates with high potential but skill gaps:
- Prioritized learning paths
- Estimated time investment
- Training resources (courses, certifications, projects)
- Skills that will have highest ROI
- Pair learning (skills that should be learned together)

**OUTPUT FORMAT (JSON only):**
{
  "skills": ["skill1", "skill2", ...],
  "skill_normalization_map": {
    "React.js": "React",
    "ReactJS": "React"
  },
  "candidates_matrix": [
    {
      "candidate_id": "id",
      "candidate_name": "name",
      "skills_proficiency": {
        "skill1": 85,
        "skill2": 70
      },
      "overall_score": 75,
      "top_skills": ["skill", ...],
      "skill_gaps": ["skill", ...]
    }
  ],
  "skill_gap_explanations": {
    "skill_name": {
      "importance": "Why this skill matters for the role",
      "criticality": "blocking|important|nice-to-have",
      "learning_time_weeks": 8,
      "learning_path": "Step-by-step guide",
      "related_skills_candidate_has": ["skill1", ...]
    }
  },
  "hypothetical_ideal_candidate": {
    "must_have_skills": [
      {
        "skill": "skill_name",
        "min_proficiency": 80,
        "years_experience": 3
      }
    ],
    "nice_to_have_skills": ["skill", ...],
    "min_years_experience": 5,
    "domain_expertise": ["domain1", ...],
    "soft_skills": ["leadership", "communication", ...],
    "education": "Bachelor's in CS or equivalent",
    "certifications": ["AWS", "Kubernetes", ...]
  },
  "upskilling_recommendations": {
    "candidate_id": {
      "candidate_name": "name",
      "prioritized_learning_path": [
        {
          "skill": "Kubernetes",
          "priority": "high",
          "estimated_weeks": 6,
          "rationale": "Required for 3/5 selected jobs",
          "resources": ["Official K8s course", "CKAD certification"],
          "prerequisite_skills": ["Docker"],
          "roi_score": 95
        }
      ],
      "pair_learning_suggestions": [
        {
          "skills": ["Docker", "Kubernetes"],
          "rationale": "Learn containerization first, then orchestration"
        }
      ],
      "total_upskilling_time_weeks": 12
    }
  },
  "job_rankings": {
    "job_id": {
      "job_title": "title",
      "top_candidates": [
        {
          "candidate_id": "id",
          "candidate_name": "name",
          "match_score": 85,
          "strengths": ["skill", ...],
          "gaps": ["skill", ...]
        }
      ]
    }
  },
  "skill_demand": [
    {
      "skill": "skill_name",
      "jobs_requiring": 3,
      "avg_proficiency": 65,
      "supply_gap": 35
    }
  ],
  "insights": {
    "most_demanded_skills": ["skill", ...],
    "hardest_to_fill_skills": ["skill", ...],
    "abundant_skills": ["skill", ...]
  }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            skills: { type: "array", items: { type: "string" } },
            skill_normalization_map: { type: "object", additionalProperties: { type: "string" } },
            candidates_matrix: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  candidate_id: { type: "string" },
                  candidate_name: { type: "string" },
                  skills_proficiency: { type: "object", additionalProperties: { type: "number" } },
                  overall_score: { type: "number" },
                  top_skills: { type: "array", items: { type: "string" } },
                  skill_gaps: { type: "array", items: { type: "string" } }
                }
              }
            },
            skill_gap_explanations: { type: "object", additionalProperties: true },
            hypothetical_ideal_candidate: { type: "object", additionalProperties: true },
            upskilling_recommendations: { type: "object", additionalProperties: true },
            job_rankings: { type: "object", additionalProperties: true },
            skill_demand: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  jobs_requiring: { type: "number" },
                  avg_proficiency: { type: "number" },
                  supply_gap: { type: "number" }
                }
              }
            },
            insights: {
              type: "object",
              properties: {
                most_demanded_skills: { type: "array", items: { type: "string" } },
                hardest_to_fill_skills: { type: "array", items: { type: "string" } },
                abundant_skills: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setMatrixData({
        ...response,
        selectedJobs: selectedJobDetails
      });
      
      // Store enhanced data separately
      setSkillGapExplanations(response.skill_gap_explanations);
      setHypotheticalProfile(response.hypothetical_ideal_candidate);
      setUpskillingRecommendations(response.upskilling_recommendations);

    } catch (error) {
      console.error("Error analyzing skill matrix:", error);
      alert("Failed to analyze skill matrix. Please try again.");
    }
    setAnalyzing(false);
  };

  const getProficiencyColor = (score) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 70) return "bg-green-400";
    if (score >= 50) return "bg-yellow-400";
    if (score >= 30) return "bg-orange-400";
    return "bg-red-400";
  };

  const getProficiencyLabel = (score) => {
    if (score >= 90) return "Expert";
    if (score >= 70) return "Proficient";
    if (score >= 50) return "Intermediate";
    if (score >= 30) return "Beginner";
    return "None";
  };

  const getOverallScoreBadgeClass = (score) => {
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const exportToCSV = () => {
    if (!matrixData) return;

    const headers = ["Candidate", ...matrixData.skills, "Overall Score"];
    const rows = matrixData.candidates_matrix.map(c => [
      c.candidate_name,
      ...matrixData.skills.map(skill => c.skills_proficiency[skill] || 0),
      c.overall_score
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skill-matrix-${Date.now()}.csv`;
    a.click();
  };

  const filteredCandidates = matrixData?.candidates_matrix.filter(c => {
    const matchesSearch = c.candidate_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (proficiencyFilter === "all") return matchesSearch;
    
    const avgScore = Object.values(c.skills_proficiency).reduce((a, b) => a + b, 0) / 
                     Object.values(c.skills_proficiency).length;
    
    if (proficiencyFilter === "high") return matchesSearch && avgScore >= 70;
    if (proficiencyFilter === "medium") return matchesSearch && avgScore >= 40 && avgScore < 70;
    if (proficiencyFilter === "low") return matchesSearch && avgScore < 40;
    
    return matchesSearch;
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif", background: "#F5F5F7", minHeight: "100vh" }}>
      <div style={{ padding: "20px 24px", background: "#fff", borderBottom: "1px solid #E5E5EA" }}>
      <Breadcrumbs items={[{ label: "Resume & Skills Studio", icon: FileText }]} />
      
      <PageHeader
        title="Resume & Skills Studio"
        subtitle="Build professional resumes, score them against jobs, and analyze candidate skills at scale"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume-build" className="gap-2">
            <FileText className="w-4 h-4" />
            Resume Build
          </TabsTrigger>
          <TabsTrigger value="resume-score" className="gap-2">
            <Target className="w-4 h-4" />
            Resume Score
          </TabsTrigger>
          <TabsTrigger value="skill-matrix" className="gap-2">
            <Grid3x3 className="w-4 h-4" />
            Skill Matrix
          </TabsTrigger>
        </TabsList>

        {/* RESUME BUILD TAB */}
        <TabsContent value="resume-build" className="space-y-4">
          {/* AI Assistant */}
          <ResumeAIAssistant 
            currentData={data}
            onApplyContent={(updates) => setData(prev => ({ ...prev, ...updates }))}
          />

          {/* AI Profile Enrichment */}
          {data.candidate_id && candidates.find(c => c.id === data.candidate_id) && (
            <CandidateAIEnrichment 
              candidate={candidates.find(c => c.id === data.candidate_id)}
              onEnrichmentComplete={(enrichmentData) => {
                // Apply enrichment to resume
                if (enrichmentData.professional_summary) {
                  setData(prev => ({ ...prev, summary: enrichmentData.professional_summary }));
                }
                if (enrichmentData.standardized_skills?.length > 0) {
                  const newSkills = enrichmentData.standardized_skills.map(s => s.normalized_name);
                  setData(prev => ({ 
                    ...prev, 
                    skills: [...new Set([...(prev.skills || []), ...newSkills])] 
                  }));
                }
              }}
            />
          )}

          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={saveResume}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <ResumeFormLeft candidates={candidates} data={data} setData={(d) => { setData(d); }} />
            </div>

            <div className="space-y-4">
              <Card ref={containerRef}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-700">Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm">Zoom</Label>
                      <div className="w-40">
                        <input
                          type="range"
                          min={40}
                          max={110}
                          value={Math.round(zoom * 100)}
                          onChange={(e) => { setZoom(Number(e.target.value) / 100); }}
                          disabled={autoscale}
                          className="w-full"
                        />
                      </div>
                      <span className="text-sm text-slate-600">{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="autoscale"
                        type="checkbox"
                        checked={autoscale}
                        onChange={(e) => setAutoscale(e.target.checked)}
                      />
                      <Label htmlFor="autoscale" className="text-sm">Autoscale</Label>
                    </div>
                  </div>
                  <div className="overflow-auto">
                    <ResumePreview ref={previewRef} data={data} scale={zoom} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* RESUME SCORE TAB */}
        <TabsContent value="resume-score" className="space-y-4">
          <ResumeScorer data={data} setData={setData} />
        </TabsContent>

        {/* SKILL MATRIX TAB */}
        <TabsContent value="skill-matrix" className="space-y-4">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              {matrixData && (
                <Button variant="outline" onClick={exportToCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              )}
              <Button onClick={analyzeSkillMatrix} disabled={analyzing || selectedJobs.length === 0} className="gap-2">
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Skills
                  </>
                )}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Jobs to Analyze</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {matrixLoading ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    No open jobs available
                  </div>
                ) : (
                  jobs.map(job => (
                    <button
                      key={job.id}
                      onClick={() => toggleJobSelection(job.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedJobs.includes(job.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{job.title}</h4>
                        {selectedJobs.includes(job.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{job.description}</p>
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.required_skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.required_skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.required_skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
              {selectedJobs.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-slate-600">
                    <strong>{selectedJobs.length}</strong> job(s) selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {matrixData && (
            <>
              <div className="flex items-center gap-2 border-b">
                <Button
                  variant={viewMode === "matrix" ? "default" : "ghost"}
                  onClick={() => setViewMode("matrix")}
                  className="gap-2"
                >
                  <Grid3x3 className="w-4 h-4" />
                  Skill Matrix
                </Button>
                <Button
                  variant={viewMode === "trends" ? "default" : "ghost"}
                  onClick={() => setViewMode("trends")}
                  className="gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Trends & Demand
                </Button>
                <Button
                  variant={viewMode === "gaps" ? "default" : "ghost"}
                  onClick={() => setViewMode("gaps")}
                  className="gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Skill Gaps
                </Button>
              </div>

              {viewMode === "matrix" && (
                <>
                  {/* Hypothetical Ideal Candidate Profile */}
                  {hypotheticalProfile && (
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          Hypothetical Ideal Candidate Profile
                        </CardTitle>
                        <p className="text-sm text-slate-600">
                          AI-generated benchmark for sourcing and hiring decisions
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {hypotheticalProfile.must_have_skills?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-purple-900 mb-2">Must-Have Skills:</h4>
                            <div className="space-y-2">
                              {hypotheticalProfile.must_have_skills.map((skill, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <span className="font-medium text-slate-900">{skill.skill}</span>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-slate-600">
                                      Min Proficiency: {skill.min_proficiency}%
                                    </span>
                                    <Badge variant="outline">
                                      {skill.years_experience}+ years
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Experience:</h4>
                            <p className="text-sm text-slate-600">
                              {hypotheticalProfile.min_years_experience}+ years
                            </p>
                          </div>
                          {hypotheticalProfile.education && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-2">Education:</h4>
                              <p className="text-sm text-slate-600">{hypotheticalProfile.education}</p>
                            </div>
                          )}
                        </div>

                        {hypotheticalProfile.domain_expertise?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Domain Expertise:</h4>
                            <div className="flex flex-wrap gap-2">
                              {hypotheticalProfile.domain_expertise.map((domain, i) => (
                                <Badge key={i} className="bg-purple-100 text-purple-800">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {hypotheticalProfile.soft_skills?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Soft Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {hypotheticalProfile.soft_skills.map((skill, i) => (
                                <Badge key={i} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Candidate Skill Proficiency Matrix</CardTitle>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Search candidates..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 w-64"
                            />
                          </div>
                          <select
                            value={proficiencyFilter}
                            onChange={(e) => setProficiencyFilter(e.target.value)}
                            className="border rounded px-3 py-2 text-sm"
                          >
                            <option value="all">All Levels</option>
                            <option value="high">High Proficiency (70+)</option>
                            <option value="medium">Medium Proficiency (40-69)</option>
                            <option value="low">Low Proficiency (&lt;40)</option>
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2">
                              <th className="text-left p-3 sticky left-0 bg-white z-10 font-semibold">
                                Candidate
                              </th>
                              {matrixData.skills.map((skill, idx) => (
                                <th key={idx} className="text-center p-3 font-semibold min-w-[100px]">
                                  {skill}
                                </th>
                              ))}
                              <th className="text-center p-3 font-semibold">
                                Overall
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCandidates?.map((candidate, idx) => {
                              const candidateData = allCandidates.find(c => c.id === candidate.candidate_id);
                              return (
                                <tr key={idx} className="border-b hover:bg-slate-50">
                                  <td className="p-3 sticky left-0 bg-white">
                                    <Link
                                      to={createPageUrl(`CandidateDetails?id=${candidate.candidate_id}`)}
                                      className="font-medium text-blue-600 hover:underline"
                                    >
                                      {candidate.candidate_name}
                                    </Link>
                                    <div className="text-xs text-slate-500">
                                      {candidateData?.current_title || 'N/A'}
                                    </div>
                                  </td>
                                  {matrixData.skills.map((skill, skillIdx) => {
                                    const score = candidate.skills_proficiency[skill] || 0;
                                    return (
                                      <td key={skillIdx} className="p-3">
                                        <div className="flex flex-col items-center gap-1">
                                          <div className={`w-full h-2 rounded-full ${getProficiencyColor(score)}`} />
                                          <span className="text-xs font-medium">{score}</span>
                                          <span className="text-xs text-slate-500">
                                            {getProficiencyLabel(score)}
                                          </span>
                                        </div>
                                      </td>
                                    );
                                  })}
                                  <td className="p-3">
                                    <div className="flex flex-col items-center gap-1">
                                      <Badge className={getOverallScoreBadgeClass(candidate.overall_score)}>
                                        {Math.round(candidate.overall_score)}
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-600" />
                          <span>Expert (90+)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-400" />
                          <span>Proficient (70-89)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-yellow-400" />
                          <span>Intermediate (50-69)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-orange-400" />
                          <span>Beginner (30-49)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-red-400" />
                          <span>None (&lt;30)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(matrixData.job_rankings || {}).map(([jobId, ranking]) => (
                      <Card key={jobId}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-600" />
                            Top Candidates: {ranking.job_title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {ranking.top_candidates?.slice(0, 5).map((candidate, idx) => (
                              <div key={idx} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <a
                                    href={createPageUrl(`CandidateDetails?id=${candidate.candidate_id}`)}
                                    className="font-medium text-blue-600 hover:underline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.location.href = createPageUrl(`CandidateDetails?id=${candidate.candidate_id}`);
                                    }}
                                  >
                                    #{idx + 1} {candidate.candidate_name}
                                  </a>
                                  <Badge className={candidate.match_score >= 80 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                                    {candidate.match_score}% match
                                  </Badge>
                                </div>
                                {candidate.strengths && candidate.strengths.length > 0 && (
                                  <div className="text-xs mb-1">
                                    <span className="text-green-700 font-medium">Strengths:</span>{" "}
                                    <span className="text-slate-600">{candidate.strengths.join(", ")}</span>
                                  </div>
                                )}
                                {candidate.gaps && candidate.gaps.length > 0 && (
                                  <div className="text-xs">
                                    <span className="text-orange-700 font-medium">Gaps:</span>{" "}
                                    <span className="text-slate-600">{candidate.gaps.join(", ")}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {viewMode === "trends" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Demand Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={matrixData.skill_demand?.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="skill" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="jobs_requiring" fill="#3b82f6" name="Jobs Requiring" />
                          <Bar dataKey="avg_proficiency" fill="#10b981" name="Avg Proficiency" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Supply vs Demand Gap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={matrixData.skill_demand?.slice(0, 8).map(s => ({
                              name: s.skill,
                              value: s.supply_gap
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {matrixData.skill_demand?.slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Most Demanded Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {matrixData.insights?.most_demanded_skills?.map((skill, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            Hardest to Fill
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {matrixData.insights?.hardest_to_fill_skills?.map((skill, idx) => (
                              <Badge key={idx} className="bg-red-100 text-red-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Abundant Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {matrixData.insights?.abundant_skills?.map((skill, idx) => (
                              <Badge key={idx} className="bg-green-100 text-green-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {viewMode === "gaps" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {matrixData.candidates_matrix
                    ?.filter(c => c.skill_gaps && c.skill_gaps.length > 0)
                    .map((candidate, idx) => {
                      const candidateData = allCandidates.find(c => c.id === candidate.candidate_id);
                      const upskillingPlan = upskillingRecommendations?.[candidate.candidate_id];
                      
                      return (
                        <Card key={idx} className="border-2 border-orange-200">
                          <CardHeader>
                            <CardTitle className="text-base">
                              <Link
                                to={createPageUrl(`CandidateDetails?id=${candidate.candidate_id}`)}
                                className="text-blue-600 hover:underline"
                              >
                                {candidate.candidate_name}
                              </Link>
                            </CardTitle>
                            <p className="text-sm text-slate-600">
                              {candidateData?.current_title || 'N/A'}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Top Skills */}
                              <div>
                                <h4 className="text-sm font-semibold text-green-700 mb-2">
                                  Top Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.top_skills?.map((skill, i) => (
                                    <Badge key={i} className="bg-green-100 text-green-800">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Skill Gaps with AI Explanations */}
                              <div>
                                <h4 className="text-sm font-semibold text-red-700 mb-2">
                                  Skill Gaps & Explanations
                                </h4>
                                <div className="space-y-2">
                                  {candidate.skill_gaps?.map((skill, i) => {
                                    const explanation = skillGapExplanations?.[skill];
                                    return (
                                      <div key={i} className="p-3 bg-red-50 rounded border border-red-200">
                                        <div className="flex items-start justify-between mb-1">
                                          <span className="font-medium text-red-900">{skill}</span>
                                          {explanation?.criticality && (
                                            <Badge className={
                                              explanation.criticality === "blocking" ? "bg-red-600 text-white" :
                                              explanation.criticality === "important" ? "bg-orange-500 text-white" :
                                              "bg-yellow-500 text-white"
                                            }>
                                              {explanation.criticality}
                                            </Badge>
                                          )}
                                        </div>
                                        {explanation && (
                                          <div className="text-xs text-slate-700 space-y-1">
                                            <p><strong>Why it matters:</strong> {explanation.importance}</p>
                                            <p><strong>Learning time:</strong> ~{explanation.learning_time_weeks} weeks</p>
                                            {explanation.related_skills_candidate_has?.length > 0 && (
                                              <p><strong>You already have:</strong> {explanation.related_skills_candidate_has.join(", ")}</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Upskilling Recommendations */}
                              {upskillingPlan?.prioritized_learning_path?.length > 0 && (
                                <div className="pt-4 border-t">
                                  <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Recommended Learning Path
                                  </h4>
                                  <div className="space-y-3">
                                    {upskillingPlan.prioritized_learning_path.slice(0, 3).map((item, i) => (
                                      <div key={i} className="p-3 bg-blue-50 rounded border border-blue-200">
                                        <div className="flex items-start justify-between mb-2">
                                          <span className="font-medium text-blue-900">
                                            {i + 1}. {item.skill}
                                          </span>
                                          <div className="flex flex-col items-end gap-1">
                                            <Badge className={
                                              item.priority === "high" ? "bg-red-100 text-red-800" :
                                              item.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                                              "bg-green-100 text-green-800"
                                            }>
                                              {item.priority} priority
                                            </Badge>
                                            <span className="text-xs text-slate-600">
                                              ~{item.estimated_weeks} weeks
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-xs text-slate-700 mb-2">{item.rationale}</p>
                                        {item.resources?.length > 0 && (
                                          <div className="text-xs">
                                            <strong>Resources:</strong> {item.resources.join(", ")}
                                          </div>
                                        )}
                                        {item.roi_score && (
                                          <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs text-slate-600">ROI Score:</span>
                                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-green-600"
                                                style={{ width: `${item.roi_score}%` }}
                                              />
                                            </div>
                                            <span className="text-xs font-semibold">{item.roi_score}%</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  {upskillingPlan.total_upskilling_time_weeks && (
                                    <p className="text-xs text-slate-600 mt-3">
                                      <strong>Total estimated time:</strong> {upskillingPlan.total_upskilling_time_weeks} weeks
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </>
          )}

          {!matrixData && !analyzing && (
            <Card>
              <CardContent className="p-12 text-center">
                <Grid3x3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Select one or more jobs above and click "Analyze Skills" to generate<br />
                  AI-powered skill matrix with candidate proficiency scoring.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}