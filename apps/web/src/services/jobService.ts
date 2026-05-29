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

export type MarketTrendDirection = "up" | "down" | "flat" | "new";
export type MarketTrendBasis = "recent_period" | "all_time_fallback";

export interface MarketTrendSkill {
  name: string;
  currentCount: number;
  previousCount: number;
  growthPct: number | null;
  demandShare: number;
  trend: MarketTrendDirection;
}

export interface MarketTrendSparklinePoint {
  date: string;
  jobCount: number;
}

export interface MarketTrendsData {
  generatedAt: string;
  periodDays: number;
  basis: MarketTrendBasis;
  topSkills: MarketTrendSkill[];
  sparkline: MarketTrendSparklinePoint[];
}

export async function fetchJobs(): Promise<JobData[]> {
  const response = await api.get<JobData[]>("/jobs");
  return response.data;
}

export async function fetchMarketTrends(
  periodDays = 30,
  limit = 3,
): Promise<MarketTrendsData> {
  const response = await api.get<MarketTrendsData>("/jobs/trends", {
    params: { periodDays, limit },
  });
  return response.data;
}
