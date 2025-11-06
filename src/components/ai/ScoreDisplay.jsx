import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ScoreDisplay({ score, details, showDetails = false }) {
  if (score === undefined || score === null) {
    return (
      <Badge variant="outline" className="text-slate-500">
        Not Scored
      </Badge>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreIcon = (score) => {
    if (score >= 70) return TrendingUp;
    if (score >= 40) return Minus;
    return TrendingDown;
  };

  const ScoreIcon = getScoreIcon(score);

  const scoreDisplay = (
    <Badge className={`gap-1 ${getScoreColor(score)}`}>
      <ScoreIcon className="w-3 h-3" />
      {Math.round(score)}%
    </Badge>
  );

  if (!details || !showDetails) {
    return details ? (
      <Popover>
        <PopoverTrigger asChild>
          <button className="cursor-pointer">
            {scoreDisplay}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm">Match Analysis</h4>
              <Progress value={score} className="mt-2" />
            </div>
            
            {details.summary && (
              <div>
                <p className="text-sm text-slate-600">{details.summary}</p>
              </div>
            )}
            
            {details.strengths && details.strengths.length > 0 && (
              <div>
                <h5 className="font-medium text-xs text-green-700 mb-2">Strengths</h5>
                <ul className="space-y-1">
                  {details.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {details.gaps && details.gaps.length > 0 && (
              <div>
                <h5 className="font-medium text-xs text-red-700 mb-2">Areas for Improvement</h5>
                <ul className="space-y-1">
                  {details.gaps.slice(0, 3).map((gap, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs">
                      <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    ) : scoreDisplay;
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Match Score</h4>
          {scoreDisplay}
        </div>
        
        <Progress value={score} className="h-2" />
        
        {details.summary && (
          <p className="text-sm text-slate-600">{details.summary}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.strengths && details.strengths.length > 0 && (
            <div>
              <h5 className="font-medium text-sm text-green-700 mb-2">Strengths</h5>
              <ul className="space-y-1">
                {details.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {details.gaps && details.gaps.length > 0 && (
            <div>
              <h5 className="font-medium text-sm text-red-700 mb-2">Areas to Address</h5>
              <ul className="space-y-1">
                {details.gaps.map((gap, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}