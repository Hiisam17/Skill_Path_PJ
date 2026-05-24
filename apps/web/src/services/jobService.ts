import { api } from "./api";

export interface JobData {
  id: number;
  title: string;
  company: string;
  location?: string | null;
  skills?: string[];
  jobType?: string | null;
  description: string;
  requirements?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  roadmapPath?: string | null;
  createdAt?: string | null;
}

export async function fetchJobs(): Promise<JobData[]> {
  const response = await api.get<JobData[]>("/jobs");
  return response.data;
}
