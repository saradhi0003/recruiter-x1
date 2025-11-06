import React from "react";
import PageHeader from "@/components/common/PageHeader";
import TalentPipelineAnalytics from "@/components/ai/TalentPipelineAnalytics";

export default function PipelineAnalytics() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Pipeline Analytics"
        subtitle="AI-powered insights and forecasting for your talent pipeline"
      />
      
      <TalentPipelineAnalytics />
    </div>
  );
}