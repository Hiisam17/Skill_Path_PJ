import React, { useState } from 'react';
import type { SuggestedJob } from '../data/mockGaps';
import { MOCK_JOBS } from '../data/mockGaps';
import './JobSelector.css';

interface JobSelectorProps {
  onAnalyze: (job: SuggestedJob) => void;
  isAnalyzing: boolean;
}

export const JobSelector: React.FC<JobSelectorProps> = ({ onAnalyze, isAnalyzing }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = MOCK_JOBS.find(j => j.id === selectedJobId);

  const handleAnalyzeClick = () => {
    if (selectedJob) {
      onAnalyze(selectedJob);
    }
  };

  const truncateSummary = (text: string) => {
    if (text.length <= 100) return text;
    return text.substring(0, 100) + "...";
  };

  return (
    <div className="job-selector-container">
      <div className="job-selector-header">
        <h2>Target Role</h2>
        <p>Select a target position to analyze your skill gaps against its requirements.</p>
      </div>

      <div className="job-selector-grid">
        {MOCK_JOBS.map((job) => {
          const isSelected = selectedJobId === job.id;
          return (
            <div
              key={job.id}
              className={`job-card ${isSelected ? 'selected' : ''}`}
              onClick={() => !isAnalyzing && setSelectedJobId(job.id)}
            >
              {isSelected && (
                <div className="job-card-checkmark">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <div className="job-card-header">
                <img src={job.logo} alt={job.companyName} className="job-card-logo" />
                {job.isHot && <span className="job-card-badge">Hot</span>}
              </div>
              <div className="job-card-info">
                <h3>{job.title}</h3>
                <p>{job.companyName}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedJob && (
        <div className="job-summary-box">
          <p><strong>Job Description:</strong> {truncateSummary(selectedJob.description)}</p>
        </div>
      )}

      <div className="job-selector-actions">
        <button
          className={`job-selector-btn ${isAnalyzing ? 'job-selector-btn-loading' : ''}`}
          disabled={!selectedJobId || isAnalyzing}
          onClick={handleAnalyzeClick}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner"></span>
              Đang phân tích...
            </>
          ) : (
            "Phân tích lộ trình cho tôi"
          )}
        </button>
      </div>
    </div>
  );
};
