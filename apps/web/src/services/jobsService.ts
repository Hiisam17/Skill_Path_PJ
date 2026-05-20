import { api } from "./api";
import type {
  GetJobsParams,
  ImportAdzunaJobsPayload,
  ImportAdzunaJobsResult,
  Job,
} from "@/types/job";

export async function importAdzunaJobs(
  payload: ImportAdzunaJobsPayload,
): Promise<ImportAdzunaJobsResult> {
  const response = await api.post<ImportAdzunaJobsResult>(
    "/jobs/import/adzuna",
    payload,
  );
  return response.data;
}

export async function getJobs(params?: GetJobsParams): Promise<Job[]> {
  const response = await api.get<Job[]>("/jobs", { params });
  return response.data;
}
