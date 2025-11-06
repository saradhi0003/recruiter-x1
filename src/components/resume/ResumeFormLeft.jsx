import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResumeFormLeft({ candidates = [], data, setData }) {
  const add = (path, item) => setData(prev => ({ ...prev, [path]: [...(prev[path] || []), item] }));
  const remove = (path, idx) => setData(prev => ({ ...prev, [path]: prev[path].filter((_, i) => i !== idx) }));
  const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* Basics */}
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={data.candidate_id || ""} onValueChange={(v) => {
            const c = candidates.find(x => x.id === v);
            setData(prev => ({
              ...prev,
              candidate_id: v,
              name: prev.name || (c ? `${c.first_name} ${c.last_name}` : ""),
              headline: prev.headline || c?.current_title || "",
              email: prev.email || c?.email || "",
              phone: prev.phone || c?.phone || "",
              location: prev.location || c?.location || ""
            }));
          }}>
            <SelectTrigger><SelectValue placeholder="Link to Candidate (optional)" /></SelectTrigger>
            <SelectContent>
              {candidates.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} • {c.current_title || "—"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input value={data.name || ""} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label>Headline</Label>
              <Input value={data.headline || ""} onChange={(e) => set("headline", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={data.email || ""} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={data.phone || ""} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={data.location || ""} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={data.website || ""} onChange={(e) => set("website", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>LinkedIn</Label>
              <Input value={data.linkedin || ""} onChange={(e) => set("linkedin", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Summary</Label>
              <Textarea rows={3} value={data.summary || ""} onChange={(e) => set("summary", e.target.value)} />
            </div>
            <div>
              <Label>Theme Color</Label>
              <Input type="color" value={data.theme_color || "#3b82f6"} onChange={(e) => set("theme_color", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          <Button size="sm" onClick={() => add("experiences", { company: "", role: "", location: "", start_date: "", end_date: "", bullets: [] })}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.experiences || []).map((exp, idx) => (
            <div key={idx} className="p-3 border rounded-lg space-y-2">
              <div className="flex justify-between">
                <div className="font-medium">Experience #{idx + 1}</div>
                <Button variant="ghost" size="icon" onClick={() => remove("experiences", idx)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Role" value={exp.role} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.experiences || [])];
                    arr[idx] = { ...arr[idx], role: v };
                    return { ...prev, experiences: arr };
                  });
                }} />
                <Input placeholder="Company" value={exp.company} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.experiences || [])];
                    arr[idx] = { ...arr[idx], company: v };
                    return { ...prev, experiences: arr };
                  });
                }} />
                <Input placeholder="Location" value={exp.location} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.experiences || [])];
                    arr[idx] = { ...arr[idx], location: v };
                    return { ...prev, experiences: arr };
                  });
                }} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Start (e.g., Jan 2023)" value={exp.start_date} onChange={(e) => {
                    const v = e.target.value;
                    setData(prev => {
                      const arr = [...(prev.experiences || [])];
                      arr[idx] = { ...arr[idx], start_date: v };
                      return { ...prev, experiences: arr };
                    });
                  }} />
                  <Input placeholder="End (or Present)" value={exp.end_date} onChange={(e) => {
                    const v = e.target.value;
                    setData(prev => {
                      const arr = [...(prev.experiences || [])];
                      arr[idx] = { ...arr[idx], end_date: v };
                      return { ...prev, experiences: arr };
                    });
                  }} />
                </div>
                <div className="md:col-span-2">
                  <Label>Bullets (one per line)</Label>
                  <Textarea rows={3} value={(exp.bullets || []).join("\n")} onChange={(e) => {
                    const v = e.target.value.split("\n").filter(Boolean);
                    setData(prev => {
                      const arr = [...(prev.experiences || [])];
                      arr[idx] = { ...arr[idx], bullets: v };
                      return { ...prev, experiences: arr };
                    });
                  }} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Button size="sm" onClick={() => add("education", { school: "", degree: "", major: "", gpa: "", start_date: "", end_date: "", details: [] })}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.education || []).map((ed, idx) => (
            <div key={idx} className="p-3 border rounded-lg space-y-2">
              <div className="flex justify-between">
                <div className="font-medium">Education #{idx + 1}</div>
                <Button variant="ghost" size="icon" onClick={() => remove("education", idx)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="School" value={ed.school} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.education || [])];
                    arr[idx] = { ...arr[idx], school: v };
                    return { ...prev, education: arr };
                  });
                }} />
                <Input placeholder="Degree" value={ed.degree} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.education || [])];
                    arr[idx] = { ...arr[idx], degree: v };
                    return { ...prev, education: arr };
                  });
                }} />
                <Input placeholder="Major" value={ed.major} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.education || [])];
                    arr[idx] = { ...arr[idx], major: v };
                    return { ...prev, education: arr };
                  });
                }} />
                <Input placeholder="GPA" value={ed.gpa} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.education || [])];
                    arr[idx] = { ...arr[idx], gpa: v };
                    return { ...prev, education: arr };
                  });
                }} />
                <Input placeholder="Start" value={ed.start_date} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.education || [])];
                    arr[idx] = { ...arr[idx], start_date: v };
                    return { ...prev, education: arr };
                  });
                }} />
                <Input placeholder="End" value={ed.end_date} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.education || [])];
                    arr[idx] = { ...arr[idx], end_date: v };
                    return { ...prev, education: arr };
                  });
                }} />
                <div className="md:col-span-2">
                  <Label>Details (one per line)</Label>
                  <Textarea rows={3} value={(ed.details || []).join("\n")} onChange={(e) => {
                    const v = e.target.value.split("\n").filter(Boolean);
                    setData(prev => {
                      const arr = [...(prev.education || [])];
                      arr[idx] = { ...arr[idx], details: v };
                      return { ...prev, education: arr };
                    });
                  }} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Button size="sm" onClick={() => add("projects", { name: "", date: "", description: [] })}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.projects || []).map((pr, idx) => (
            <div key={idx} className="p-3 border rounded-lg space-y-2">
              <div className="flex justify-between">
                <div className="font-medium">Project #{idx + 1}</div>
                <Button variant="ghost" size="icon" onClick={() => remove("projects", idx)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Project Name" value={pr.name} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.projects || [])];
                    arr[idx] = { ...arr[idx], name: v };
                    return { ...prev, projects: arr };
                  });
                }} />
                <Input placeholder="Date" value={pr.date} onChange={(e) => {
                  const v = e.target.value;
                  setData(prev => {
                    const arr = [...(prev.projects || [])];
                    arr[idx] = { ...arr[idx], date: v };
                    return { ...prev, projects: arr };
                  });
                }} />
                <div className="md:col-span-2">
                  <Label>Description bullets (one per line)</Label>
                  <Textarea rows={3} value={(pr.description || []).join("\n")} onChange={(e) => {
                    const v = e.target.value.split("\n").filter(Boolean);
                    setData(prev => {
                      const arr = [...(prev.projects || [])];
                      arr[idx] = { ...arr[idx], description: v };
                      return { ...prev, projects: arr };
                    });
                  }} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <Button size="sm" onClick={() => setData(prev => ({ ...prev, skills: [ ...(prev.skills || []), "" ] }))}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data.skills || []).map((sk, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input value={sk} onChange={(e) => {
                const v = e.target.value;
                setData(prev => {
                  const arr = [...(prev.skills || [])];
                  arr[idx] = v;
                  return { ...prev, skills: arr };
                });
              }} placeholder={`Skill #${idx + 1}`} />
              <Button variant="ghost" size="icon" onClick={() => {
                setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}