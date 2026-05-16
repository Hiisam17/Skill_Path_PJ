import { api } from "./api";

/**
 * Response from the backend gap analysis endpoint.
 */
export interface GapAnalysisResponse {
  requiredSkillIds: string[];
  gapSkillIds: string[];
  matchScore: number;
  summary: string;
  isNewUser: boolean;
}

export interface JobData {
  id: number;
  title: string;
  company: string;
  location?: string;
  skills?: string[];
  jobType?: string;
  description: string;
  requirements?: string;
  source?: string;
  sourceUrl?: string;
  roadmapPath: string;
}

/**
 * Fetches all available jobs from the backend.
 */
export async function fetchJobs(): Promise<JobData[]> {
  const response = await api.get<JobData[]>("/jobs");
  return response.data;
}

/**
 * Analyzes the gap between a user's skills and a job's requirements.
 * Calls the real backend API which uses Claude/Gemini/Groq AI for analysis.
 *
 * @param jobId The database ID of the target job to analyze against
 * @returns A promise that resolves to an array of missing skill/node IDs
 */
export async function analyzeGap(jobId: string): Promise<string[]> {
  const response = await api.post<GapAnalysisResponse>("/jobs/analyze-gap", {
    jobId: Number(jobId),
  });

  const data = response.data;

  // Store full analysis result for potential use by other components
  if (typeof window !== "undefined") {
    sessionStorage.setItem("lastGapAnalysis", JSON.stringify(data));
  }

  // Return gapSkillIds to maintain backward compatibility with SkillTree
  return data.gapSkillIds;
}

/**
 * Retrieves the last gap analysis result from session storage.
 * Useful for showing the isNewUser disclaimer or match score in UI.
 */
export function getLastGapAnalysis(): GapAnalysisResponse | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("lastGapAnalysis");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GapAnalysisResponse;
  } catch {
    return null;
  }
}
