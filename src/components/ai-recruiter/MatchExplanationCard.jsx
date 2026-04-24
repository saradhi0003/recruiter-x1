import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function MatchExplanationCard({ match }) {
  return (
    <div className="space-y-4">
      {/* AI-generated explanation */}
      {match.ai_summary && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
              AI Analysis
            </span>
          </div>
          <p className="text-sm text-foreground">{match.ai_summary}</p>
        </div>
      )}

      {/* Matched skills */}
      {match.matched_skills?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Matched Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {match.matched_skills.map((skill, i) => (
              <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {match.missing_skills?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {match.missing_skills.map((skill, i) => (
              <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {match.strengths?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Strengths</h4>
          <ul className="text-sm space-y-1">
            {match.strengths.map((strength, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-600">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk flags */}
      {match.risk_flags?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">Caution Flags</h4>
          <ul className="text-sm text-yellow-900 space-y-1">
            {match.risk_flags.map((flag, i) => (
              <li key={i} className="flex gap-2">
                <span>⚠️</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full explanation */}
      {match.explanation && (
        <div className="text-sm bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-muted-foreground">{match.explanation}</p>
        </div>
      )}
    </div>
  );
}