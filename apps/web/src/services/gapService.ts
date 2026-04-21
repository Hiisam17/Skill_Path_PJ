import { MOCK_JOBS } from "../data/mockGaps";
import { api } from "./api"; // Ensure axios instance or basic api util is exported from here

export const USE_MOCK = true;

/**
 * Analyzes the gap between a user's skills and a job's requirements.
 * @param jobId The target job ID to analyze against
 * @returns A promise that resolves to an array of missing skill/node IDs
 */
export async function analyzeGap(jobId: string): Promise<string[]> {
  if (USE_MOCK) {
    // Simulate network delay of 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const job = MOCK_JOBS.find(j => j.id === jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    
    // In mock mode, we just return the predefined gapNodes for this job.
    // The component UI logic will filter out the ones already COMPLETED.
    return job.gapNodes;
  } else {
    // Call the real API
    const response = await api.post(`/jobs/${jobId}/analyze-gaps`);
    return response.data.gapNodes;
  }
}
