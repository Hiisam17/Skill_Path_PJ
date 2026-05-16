import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { JobSelector } from "@/features/JobSelector";
import { analyzeGap, getLastGapAnalysis } from "@/services/gapService";
import type { SuggestedJob } from "@/data/mockGaps";
import "./JobMarketPage.css";

export const JobMarketPage: React.FC = () => {
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const navigate = useNavigate();

  const handleAnalyzeJob = async (job: SuggestedJob) => {
    setIsAnalyzingJob(true);

    const timeoutId = setTimeout(() => {
      alert("Error: Server took too long to respond (30s timeout).");
      setIsAnalyzingJob(false);
    }, 30000);

    try {
      const gapNodeIds = await analyzeGap(job.id);
      clearTimeout(timeoutId);

      // Check if the user is new (no completed skills)
      const analysis = getLastGapAnalysis();
      if (analysis?.isNewUser) {
        alert(
          "Lưu ý: Kết quả dựa trên lộ trình bạn đã hoàn thành trong app. " +
          "Bạn có thể đã có kinh nghiệm trước đó chưa được tính."
        );
      }

      localStorage.setItem("activeGapAnalysis", JSON.stringify({
        roadmapPath: job.roadmapPath,
        jobTitle: job.title,
        companyName: job.companyName,
        gapNodes: gapNodeIds,
        matchScore: analysis?.matchScore,
        summary: analysis?.summary,
      }));

      navigate(job.roadmapPath);
    } catch (e: any) {
      clearTimeout(timeoutId);
      const errorMsg = e?.response?.data?.message || e?.message || "Error analyzing gap";
      alert(`Gap analysis failed: ${errorMsg}`);
      setIsAnalyzingJob(false);
    }
  };

  return (
    <div className="job-market-page">
      <div className="job-market-header">
        <h1>Job Market</h1>
        <p>Explore backend developer positions and analyze your skill gaps instantly.</p>
      </div>

      <div className="job-market-content">
        <JobSelector onAnalyze={handleAnalyzeJob} isAnalyzing={isAnalyzingJob} />
      </div>
    </div>
  );
};
