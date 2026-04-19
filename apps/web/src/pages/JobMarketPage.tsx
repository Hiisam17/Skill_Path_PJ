import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { JobSelector } from "@/components/features/JobSelector";
import { analyzeGap } from "@/services/gapService";
import type { SuggestedJob } from "@/data/mockGaps";
import "./JobMarketPage.css";

export const JobMarketPage: React.FC = () => {
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const navigate = useNavigate();

  const handleAnalyzeJob = async (job: SuggestedJob) => {
    setIsAnalyzingJob(true);

    const timeoutId = setTimeout(() => {
      alert("Error: Server took too long to respond (15s timeout).");
      setIsAnalyzingJob(false);
    }, 15000);

    try {
      const gapNodeIds = await analyzeGap(job.id);
      clearTimeout(timeoutId);

      localStorage.setItem("activeGapAnalysis", JSON.stringify({
        roadmapPath: job.roadmapPath,
        jobTitle: job.title,
        companyName: job.companyName,
        gapNodes: gapNodeIds
      }));

      navigate(job.roadmapPath);
    } catch (e) {
      clearTimeout(timeoutId);
      alert("Error analyzing gap");
      setIsAnalyzingJob(false);
    }
  };

  return (
    <div className="job-market-page">
      <div className="job-market-header">
        <h1>Job Market</h1>
        <p>Explore frontend developer positions and analyze your skill gaps instantly.</p>
      </div>

      <div className="job-market-content">
        <JobSelector onAnalyze={handleAnalyzeJob} isAnalyzing={isAnalyzingJob} />
      </div>
    </div>
  );
};
