export interface Job {
  id: string;
  externalId: string;
  source: string;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  url?: string | null;
  postedAt?: string | null;
  crawledAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportAdzunaJobsPayload {
  query?: string;
  country?: string;
  location?: string;
  resultsPerPage?: number;
  page?: number;
}

export interface ImportAdzunaJobsResult {
  imported: number;
  updated: number;
  totalFetched: number;
}

export interface GetJobsParams {
  query?: string;
  source?: string;
  limit?: number;
}
