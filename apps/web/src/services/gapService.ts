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

/**
 * Analyzes the gap between a user's skills and a job's requirements.
 * Calls the real backend API which uses Claude AI for analysis.
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
