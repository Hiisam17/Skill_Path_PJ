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
                {job.logo && <img src={job.logo} alt={job.companyName} className="job-card-logo" />}
                {job.isHot && <span className="job-card-badge">Hot</span>}
              </div>
              <div className="job-card-info">
                <h3>{job.title}</h3>
                <p>{job.companyName}</p>
                {job.location && <p className="text-xs text-slate-400 mt-1">{job.location}  • {job.jobType}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedJob && (
        <div className="job-summary-box flex flex-col gap-4 mt-6 p-4 bg-slate-800 rounded-md border border-slate-700">
          <div>
            <strong className="text-lg text-slate-100 block mb-2">Job Description:</strong>
            <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans">{selectedJob.description.trim()}</pre>
          </div>
          <div>
            <strong className="text-lg text-slate-100 block mb-2">Requirements:</strong>
            <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans">{selectedJob.requirements?.trim()}</pre>
          </div>
          {selectedJob.skills && selectedJob.skills.length > 0 && (
            <div>
              <strong className="text-lg text-slate-100 block mb-2">Skills:</strong>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">{skill}</span>
                ))}
              </div>
            </div>
          )}
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
               Đang thân tích...
             </>
          ) : (
            "Phân tích lộ trình cho tôi"
          )}
        </button>
      </div>
    </div>
  );
};