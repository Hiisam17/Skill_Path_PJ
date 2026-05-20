import React, { useEffect, useState } from "react";
import { getJobs, importAdzunaJobs } from "@/services/jobsService";
import type { ImportAdzunaJobsResult, Job } from "@/types/job";
import "./JobMarketPage.css";

const DEFAULT_COUNTRY = "gb";
const DEFAULT_LIMIT = 20;

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const shortDescription = (description?: string | null): string => {
  if (!description) return "No description available.";
  const text = stripHtml(description);
  return text.length > 220 ? `${text.slice(0, 220)}...` : text;
};

export const JobMarketPage: React.FC = () => {
  const [query, setQuery] = useState("react developer");
  const [location, setLocation] = useState("London");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastImport, setLastImport] = useState<ImportAdzunaJobsResult | null>(
    null,
  );

  const loadJobs = async (searchQuery = query) => {
    setIsLoadingJobs(true);
    setError(null);

    try {
      const data = await getJobs({
        query: searchQuery,
        source: "ADZUNA",
        limit: DEFAULT_LIMIT,
      });
      setJobs(data);
    } catch {
      setError("Không thể tải danh sách jobs.");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    void loadJobs();
    // Chỉ load danh sách ban đầu một lần khi mở trang Job Market.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);
    setLastImport(null);

    try {
      const result = await importAdzunaJobs({
        query: query.trim() || undefined,
        country: DEFAULT_COUNTRY,
        location: location.trim() || undefined,
        resultsPerPage: DEFAULT_LIMIT,
        page: 1,
      });

      setLastImport(result);
      await loadJobs(query);
    } catch {
      setError(
        "Import từ Adzuna thất bại. Kiểm tra ADZUNA_APP_ID, ADZUNA_APP_KEY và kết nối backend.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="job-market-page">
      <div className="job-market-header">
        <h1>Job Market</h1>
        <p>Import jobs from Adzuna and browse saved job listings.</p>
      </div>

      <section className="job-market-toolbar" aria-label="Job import controls">
        <label className="job-market-field">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="react developer"
          />
        </label>

        <label className="job-market-field">
          <span>Location</span>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="London"
          />
        </label>

        <button
          type="button"
          className="job-market-import-btn"
          onClick={handleImport}
          disabled={isImporting}
        >
          {isImporting ? "Importing..." : "Import from Adzuna"}
        </button>
      </section>

      {error && <div className="job-market-alert error">{error}</div>}

      {lastImport && (
        <div className="job-market-alert success">
          Imported {lastImport.imported}, updated {lastImport.updated}, fetched{" "}
          {lastImport.totalFetched}.
        </div>
      )}

      <section className="job-market-content" aria-label="Imported jobs">
        {isLoadingJobs ? (
          <div className="job-market-empty">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="job-market-empty">
            No jobs found. Import from Adzuna to populate this list.
          </div>
        ) : (
          <div className="job-list">
            {jobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-card-main">
                  <div>
                    <h2>{job.title}</h2>
                    <p className="job-card-meta">
                      {job.company || "Unknown company"}
                      {job.location ? ` • ${job.location}` : ""}
                    </p>
                  </div>
                  <span className="job-card-source">{job.source}</span>
                </div>

                <p className="job-card-description">
                  {shortDescription(job.description)}
                </p>

                {job.url && (
                  <a
                    className="job-card-link"
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View job
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
