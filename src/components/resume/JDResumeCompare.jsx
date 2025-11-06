import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Plus } from "lucide-react";
import { computeScore } from "@/components/common/scoring";

export default function JDResumeCompare({ jdText = "", resumeText = "", data, requiredSkills = [], onAddSkill }) {
  // Reuse scoring helper to detect missing skills reliably
  const result = computeScore({ resumeData: data, resumeText, jdText, requiredSkills });
  const required = Array.from(new Set([...(requiredSkills || []), ...result.hard_stats.filter(s => s.jd_frequency > 0).map(s => s.skill)]));

  const rows = required.map(skill => {
    const stat = result.hard_stats.find(s => s.skill === skill);
    const inJD = !!(stat && stat.jd_frequency > 0);
    const inResume = !!(stat && stat.resume_frequency > 0);
    return { skill, inJD, inResume };
  });

  const missing = rows.filter(r => r.inJD && !r.inResume).map(r => r.skill);

  return (
    <Card>
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-lg">JD vs Resume Comparison</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Required: {rows.length}</Badge>
          <Badge className="bg-amber-100 text-amber-800">Missing: {missing.length}</Badge>
          {missing.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => onAddSkill?.(missing)}>
              <Plus className="w-4 h-4 mr-1" /> Add all missing to Resume
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {rows.map((r) => (
            <div key={r.skill} className="border rounded-lg p-2 flex items-center justify-between">
              <span className="text-sm">{r.skill}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {r.inJD ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-red-600" />} JD
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {r.inResume ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-red-600" />} Resume
                </Badge>
                {!r.inResume && r.inJD && (
                  <Button size="sm" variant="ghost" onClick={() => onAddSkill?.([r.skill])}>
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}