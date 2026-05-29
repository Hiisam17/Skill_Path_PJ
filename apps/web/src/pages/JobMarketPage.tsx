import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Briefcase,
  ChevronRight,
  Clock,
  Lightbulb,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { analyzeJobJD, type JobAnalysisResponse } from "@/services/gapService";
import { fetchJobs, type JobData } from "@/services/jobService";
import "./JobMarketPage.css";

const ROADMAP_ROUTE_MAP: Record<string, { title: string; href: string }> = {
  "1": { title: "Frontend Developer", href: `/roadmaps/${encodeURIComponent("Frontend")}` },
  "2": { title: "Backend Developer", href: `/roadmaps/${encodeURIComponent("Backend")}` },
  "3": { title: "DevOps Engineer", href: `/roadmaps/${encodeURIComponent("DevOps")}` },
  frontend: { title: "Frontend Developer", href: `/roadmaps/${encodeURIComponent("Frontend")}` },
  "frontend developer": { title: "Frontend Developer", href: `/roadmaps/${encodeURIComponent("Frontend")}` },
  backend: { title: "Backend Developer", href: `/roadmaps/${encodeURIComponent("Backend")}` },
  "backend developer": { title: "Backend Developer", href: `/roadmaps/${encodeURIComponent("Backend")}` },
  devops: { title: "DevOps Engineer", href: `/roadmaps/${encodeURIComponent("DevOps")}` },
  "devops engineer": { title: "DevOps Engineer", href: `/roadmaps/${encodeURIComponent("DevOps")}` },
  "full-stack": { title: "Full Stack Developer", href: `/roadmaps/${encodeURIComponent("Full Stack")}` },
  fullstack: { title: "Full Stack Developer", href: `/roadmaps/${encodeURIComponent("Full Stack")}` },
  "full stack": { title: "Full Stack Developer", href: `/roadmaps/${encodeURIComponent("Full Stack")}` },
  "full stack developer": { title: "Full Stack Developer", href: `/roadmaps/${encodeURIComponent("Full Stack")}` },
};

type JobFeedItem = {
  id: number;
  title: string;
  company: string;
  location: string;
  jobType: string;
  skills: string[];
  description: string;
  roadmapPath: string;
  postedAt: string;
};

type JobSearchFilters = {
  keyword: string;
  roadmap: string;
  location: string;
};

const roadmapOptions = [
  "Tất cả lộ trình",
  "Frontend",
  "Backend",
  "DevOps",
  "Data Analyst",
  "UI/UX",
];

const defaultFilters: JobSearchFilters = {
  keyword: "",
  roadmap: roadmapOptions[0],
  location: "",
};

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatRoadmapPath(value?: string | null) {
  if (!value) return "Chưa phân loại";

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed) && typeof parsed[0] === "string") {
      return formatRoadmapPath(parsed[0]);
    }
  } catch {
    // Roadmap strings from the API can be plain labels or encoded references.
  }

  if (value.startsWith("@roadmap:")) {
    const type = value.split(":")[1] ?? "";
    const labelMap: Record<string, string> = {
      frontend: "Frontend",
      backend: "Backend",
      devops: "DevOps",
    };

    return labelMap[type.toLocaleLowerCase("vi-VN")] ?? type;
  }

  return value;
}

function resolveRoadmapLink(path: string) {
  const raw = path.trim();
  const decoded = decodeURIComponent(raw);
  const pathKey = decoded.replace(/^\/?roadmaps\//i, "");
  const roadmapKey = pathKey.startsWith("@roadmap:")
    ? pathKey.split(":")[1] ?? ""
    : pathKey;
  const normalizedKey = roadmapKey.toLocaleLowerCase("vi-VN");
  const mapped = ROADMAP_ROUTE_MAP[normalizedKey];

  if (mapped) return { link: mapped.href, title: mapped.title };

  if (/^\/?roadmaps\//i.test(decoded)) {
    return {
      link: `/roadmaps/${encodeURIComponent(roadmapKey)}`,
      title: formatRoadmapPath(roadmapKey),
    };
  }

  if (raw.startsWith("/")) {
    return { link: raw, title: formatRoadmapPath(pathKey) };
  }

  return {
    link: `/roadmaps/${encodeURIComponent(roadmapKey)}`,
    title: formatRoadmapPath(roadmapKey),
  };
}

function formatPostedAt(createdAt?: string | null) {
  if (!createdAt) return "Đăng gần đây";

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return "Đăng gần đây";

  const diffInDays = Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / 86_400_000)
  );

  if (diffInDays === 0) return "Đăng hôm nay";
  return `Đăng ${diffInDays} ngày trước`;
}

function getAnalysisErrorMessage(error: unknown) {
  const fallback = "Không thể phân tích JD lúc này. Vui lòng thử lại sau.";

  if (typeof error !== "object" || error === null) return fallback;

  const axiosLikeError = error as {
    message?: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
      };
    };
  };

  if (axiosLikeError.response?.status === 401) {
    return "Vui lòng đăng nhập để phân tích JD bằng AI.";
  }

  return (
    axiosLikeError.response?.data?.error ||
    axiosLikeError.response?.data?.message ||
    axiosLikeError.message ||
    fallback
  );
}

function getRoadmapLinks(pathData?: string | string[]) {
  if (!pathData) return [];

  let paths: string[] = [];

  if (Array.isArray(pathData)) {
    paths = pathData;
  } else {
    try {
      const parsed = JSON.parse(pathData) as unknown;
      paths = Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
        ? parsed
        : [pathData];
    } catch {
      paths = [pathData];
    }
  }

  return paths.map((path) => {
    return resolveRoadmapLink(path);
  });
}

function buildAnalysisSkillList(result: JobAnalysisResponse, sourceSkills: string[] = []) {
  return Array.from(new Set([...result.must_have, ...result.nice_to_have, ...sourceSkills]))
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function mapJobData(job: JobData): JobFeedItem {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location || "Chưa cập nhật",
    jobType: job.jobType || "Linh hoạt",
    skills: job.skills ?? [],
    description: job.description,
    roadmapPath: formatRoadmapPath(job.roadmapPath),
    postedAt: formatPostedAt(job.createdAt),
  };
}

function filterJobs(jobs: JobFeedItem[], filters: JobSearchFilters) {
  const keyword = normalizeText(filters.keyword.trim());
  const location = normalizeText(filters.location.trim());
  const roadmap =
    filters.roadmap === roadmapOptions[0] ? "" : normalizeText(filters.roadmap);

  return jobs.filter((job) => {
    const haystack = normalizeText(
      [
        job.title,
        job.company,
        job.location,
        job.jobType,
        job.roadmapPath,
        ...job.skills,
      ].join(" ")
    );

    return (
      (!keyword || haystack.includes(keyword)) &&
      (!location || normalizeText(job.location).includes(location)) &&
      (!roadmap || normalizeText(job.roadmapPath).includes(roadmap))
    );
  });
}

function JobSearchSection({
  filters,
  onFiltersChange,
  onSubmit,
}: {
  filters: JobSearchFilters;
  onFiltersChange: React.Dispatch<React.SetStateAction<JobSearchFilters>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-medium text-[#94A3B8]">
          Thị trường việc làm
        </p>
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          Khám phá thị trường việc làm theo lộ trình của bạn.
        </h1>
      </div>

      <Card className="gap-0 rounded-lg border-[#1F2937] bg-[#111726] py-0 shadow-sm">
        <CardContent className="p-3">
          <form
            onSubmit={onSubmit}
            className="grid gap-3 md:grid-cols-[minmax(0,1.25fr)_minmax(180px,0.8fr)_minmax(0,1fr)_auto]"
          >
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                value={filters.keyword}
                onChange={(event) =>
                  onFiltersChange((current) => ({
                    ...current,
                    keyword: event.target.value,
                  }))
                }
                placeholder="Job title, công ty"
                className="h-11 rounded-md border-[#1F2937] bg-[#090E1A] pl-9 text-white placeholder:text-[#64748B] focus-visible:border-[#00BDD6] focus-visible:ring-[#00BDD6]/30"
              />
            </label>

            <label className="block">
              <select
                value={filters.roadmap}
                onChange={(event) =>
                  onFiltersChange((current) => ({
                    ...current,
                    roadmap: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-md border border-[#1F2937] bg-[#090E1A] px-3 text-sm text-white shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-[#00BDD6] focus-visible:ring-[3px] focus-visible:ring-[#00BDD6]/30"
              >
                {roadmapOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="relative block">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                value={filters.location}
                onChange={(event) =>
                  onFiltersChange((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="Hà Nội, HCM..."
                className="h-11 rounded-md border-[#1F2937] bg-[#090E1A] pl-9 text-white placeholder:text-[#64748B] focus-visible:border-[#00BDD6] focus-visible:ring-[#00BDD6]/30"
              />
            </label>

            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-md bg-[#00BDD6] font-semibold text-[#04111D] hover:bg-[#00E5FF]"
            >
              <Search className="size-4" />
              Tìm kiếm
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function JobCard({
  job,
  isActive,
  onSelect,
}: {
  job: JobFeedItem;
  isActive: boolean;
  onSelect: () => void;
}) {
  const visibleSkills = job.skills.slice(0, 4);
  const remainingSkills = job.skills.length - visibleSkills.length;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group gap-0 rounded-lg py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5",
        "cursor-pointer outline-none focus-visible:border-[#00BDD6] focus-visible:ring-[3px] focus-visible:ring-[#00BDD6]/30",
        isActive
          ? "border-[#00BDD6] bg-[#0D1829] shadow-[0_0_30px_rgba(0,189,214,0.12)]"
          : "border-[#1F2937] bg-[#111726] hover:border-[#00BDD6]/40 hover:shadow-[0_0_30px_rgba(0,189,214,0.08)]"
      )}
    >
      <CardHeader className="px-5 pt-5">
        <CardTitle className="text-lg leading-snug text-white">{job.title}</CardTitle>
        <CardDescription className="font-medium text-[#94A3B8]">{job.company}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#94A3B8]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="size-4" />
            {job.jobType}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="rounded-md border border-[#1F2937] bg-[#0B1220] text-[#D8E3F0] hover:bg-[#0B1220]"
            >
              {skill}
            </Badge>
          ))}
          {remainingSkills > 0 && (
            <Badge
              variant="outline"
              className="rounded-md border-[#00BDD6]/30 text-[#00E5FF]"
            >
              +{remainingSkills} nữa
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-3 border-t border-[#1F2937] px-5 py-4 text-xs text-[#94A3B8]">
        <span>{job.postedAt}</span>
        <Badge
          variant="outline"
          className="rounded-md border-[#00BDD6]/30 bg-[#00BDD6]/10 text-[#00E5FF]"
        >
          <Briefcase className="size-3" />
          {job.roadmapPath}
        </Badge>
      </CardFooter>
    </Card>
  );
}

function JobList({
  jobs,
  selectedJob,
  isLoading,
  loadError,
  onSelectJob,
}: {
  jobs: JobFeedItem[];
  selectedJob: JobFeedItem | null;
  isLoading: boolean;
  loadError: string | null;
  onSelectJob: (job: JobFeedItem) => void;
}) {
  return (
    <Card className="gap-0 rounded-lg border-[#1F2937] bg-[#111726] py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#1F2937] px-5 py-4">
        <div>
          <CardTitle className="text-base text-white">Danh sách việc làm</CardTitle>
          <CardDescription className="text-[#94A3B8]">
            {jobs.length} công việc phù hợp
          </CardDescription>
        </div>
        {isLoading && <Loader2 className="size-4 animate-spin text-[#00E5FF]" />}
      </CardHeader>

      <CardContent className="p-3">
        <div className="job-feed-scrollbar max-h-[calc(100vh-18rem)] space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <JobListSkeleton />
          ) : loadError ? (
            <EmptyState tone="error" title={loadError} />
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isActive={selectedJob?.id === job.id}
                onSelect={() => onSelectJob(job)}
              />
            ))
          ) : (
            <EmptyState title="Không tìm thấy công việc phù hợp với bộ lọc hiện tại." />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function JobListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className="gap-4 rounded-lg border-[#1F2937] bg-[#111726] py-5 shadow-sm"
        >
          <CardHeader className="space-y-2 px-5">
            <Skeleton className="h-5 w-3/4 bg-[#1F2937]" />
            <Skeleton className="h-4 w-1/2 bg-[#1F2937]" />
          </CardHeader>
          <CardContent className="space-y-4 px-5">
            <Skeleton className="h-4 w-2/3 bg-[#1F2937]" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-md bg-[#1F2937]" />
              <Skeleton className="h-6 w-20 rounded-md bg-[#1F2937]" />
              <Skeleton className="h-6 w-14 rounded-md bg-[#1F2937]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  tone = "muted",
}: {
  title: string;
  tone?: "muted" | "error";
}) {
  return (
    <Card
      className={cn(
        "rounded-lg border-dashed py-0 shadow-none",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-red-300"
          : "border-[#1F2937] bg-[#0B1220] text-[#94A3B8]"
      )}
    >
      <CardContent className="p-6 text-center text-sm font-medium">
        {title}
      </CardContent>
    </Card>
  );
}

function EmptyDetailsPanel() {
  return (
    <Card className="min-h-[520px] justify-center rounded-lg border-dashed border-[#1F2937] bg-[#111726] shadow-sm">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex size-11 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B1220]">
          <Briefcase className="size-5 text-[#00E5FF]" />
        </div>
        <CardTitle className="text-base text-white">
          Chọn một công việc để xem chi tiết
        </CardTitle>
        <CardDescription className="max-w-sm text-[#94A3B8]">
          Nội dung JD, thông tin công ty và hành động phân tích AI sẽ hiển thị tại đây.
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function JobAnalysisDrawer({
  job,
  result,
  isOpen,
  onClose,
}: {
  job: JobFeedItem;
  result: JobAnalysisResponse | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!result) return null;

  const roadmapLinks = getRoadmapLinks(result.roadmapPath);
  const matchingSkills = buildAnalysisSkillList(result, job.skills);
  const experienceText =
    result.experience_years === "N/A"
      ? "Kinh nghiệm: N/A"
      : `${result.experience_years} năm kinh nghiệm`;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-[#090E1A]/80 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-xl transform flex-col border-l border-[#1F2937] bg-[#090E1A] shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between border-b border-[#1F2937] px-6 py-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-[#00E5FF]" />
            <h2 className="text-lg font-bold text-white">Kết quả phân tích JD</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#94A3B8] hover:bg-[#111726] hover:text-white"
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="job-feed-scrollbar flex-1 space-y-7 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-md border border-[#00BDD6]/30 bg-[#00BDD6]/10 px-3 py-1.5 text-[#00E5FF] hover:bg-[#00BDD6]/10">
              <Briefcase className="size-3.5" />
              {result.seniority}
            </Badge>
            <Badge className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-200 hover:bg-emerald-400/10">
              <Clock className="size-3.5" />
              {experienceText}
            </Badge>
          </div>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">
              <ChevronRight className="size-4 text-red-300" />
              Must-have Skills
            </h3>
            {result.must_have.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.must_have.map((skill) => (
                  <Badge
                    key={`must-${skill}`}
                    className="rounded-md border border-red-400/30 bg-red-400/10 text-red-100 hover:bg-red-400/10"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#94A3B8]">Không tìm thấy kỹ năng bắt buộc.</p>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">
              <ChevronRight className="size-4 text-[#94A3B8]" />
              Nice-to-have Skills
            </h3>
            {result.nice_to_have.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.nice_to_have.map((skill) => (
                  <Badge
                    key={`nice-${skill}`}
                    variant="outline"
                    className="rounded-md border-[#1F2937] text-[#D8E3F0]"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#94A3B8]">Không có kỹ năng bổ sung rõ ràng.</p>
            )}
          </section>

          <section className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-100">
              <Lightbulb className="size-4 text-amber-200" />
              AI khuyên bạn
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-6 text-amber-50/90">
              {result.ai_advice}
            </p>
          </section>

          {roadmapLinks.length > 0 && (
            <section className="space-y-3 border-t border-[#1F2937] pt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">
                Lộ trình đề xuất
              </h3>
              <div className="space-y-2">
                {roadmapLinks.map((item) => (
                  <Link
                    key={`${item.link}-${item.title}`}
                    to={item.link}
                    className="flex items-center justify-between rounded-lg border border-[#00BDD6]/30 bg-[#00BDD6]/10 px-4 py-3 font-semibold text-[#00E5FF] transition-colors hover:bg-[#00BDD6]/20"
                    onClick={() => {
                      localStorage.setItem(
                        "activeGapAnalysis",
                        JSON.stringify({
                          roadmapPath: item.link,
                          jobTitle: job.title,
                          companyName: job.company,
                          gapNodes: matchingSkills,
                          matchingSkills,
                          mustHaveSkills: result.must_have,
                          niceToHaveSkills: result.nice_to_have,
                          summary: result.ai_advice,
                        }),
                      );
                      onClose();
                    }}
                  >
                    {item.title}
                    <ChevronRight className="size-4" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

function JobDetailsPanel({ job }: { job: JobFeedItem | null }) {
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResponse | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
    setAnalysisResult(null);
    setAnalysisStatus("idle");
    setAnalysisError(null);
    setIsAnalysisOpen(false);
  }, [job?.id]);

  if (!job) return <EmptyDetailsPanel />;

  const handleAnalyzeJobJD = async () => {
    if (analysisResult) {
      setIsAnalysisOpen(true);
      return;
    }

    setAnalysisStatus("loading");
    setAnalysisError(null);

    try {
      const result = await analyzeJobJD(job.id);
      setAnalysisResult(result);
      setAnalysisStatus("success");
      setIsAnalysisOpen(true);
    } catch (error) {
      setAnalysisStatus("error");
      setAnalysisError(getAnalysisErrorMessage(error));
    }
  };

  return (
    <>
      <Card className="max-h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-lg border-[#1F2937] bg-[#111726] py-0 shadow-sm">
        <CardHeader className="space-y-4 border-b border-[#1F2937] px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl leading-tight text-white">{job.title}</CardTitle>
              <CardDescription className="text-base font-medium text-[#94A3B8]">
                {job.company}
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={handleAnalyzeJobJD}
              disabled={analysisStatus === "loading"}
              className="rounded-md bg-[#00BDD6] font-semibold text-[#04111D] hover:bg-[#00E5FF] disabled:opacity-70"
            >
              {analysisStatus === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {analysisStatus === "loading"
                ? "Đang phân tích..."
                : analysisResult
                  ? "Xem lại phân tích"
                  : "Phân tích JD bằng AI"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="rounded-md border border-[#1F2937] bg-[#0B1220] text-[#D8E3F0] hover:bg-[#0B1220]"
            >
              <MapPin className="size-3" />
              {job.location}
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-md border border-[#1F2937] bg-[#0B1220] text-[#D8E3F0] hover:bg-[#0B1220]"
            >
              <Building2 className="size-3" />
              {job.jobType}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-md border-[#00BDD6]/30 bg-[#00BDD6]/10 text-[#00E5FF]"
            >
              <Briefcase className="size-3" />
              {job.roadmapPath}
            </Badge>
          </div>

          {analysisError && (
            <div className="flex items-start gap-2 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="job-feed-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="rounded-md border-[#1F2937] text-[#D8E3F0]"
              >
                {skill}
              </Badge>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">
              Mô tả công việc
            </h3>
            <p className="whitespace-pre-wrap text-[#D8E3F0]">
              {job.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <JobAnalysisDrawer
        job={job}
        result={analysisResult}
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
      />
    </>
  );
}

function JobDetailsSlideOver({
  job,
  isOpen,
  onClose,
}: {
  job: JobFeedItem | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#090E1A]/80 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l border-[#1F2937] bg-[#090E1A] p-4 shadow-lg transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#94A3B8] hover:bg-[#111726] hover:text-white"
          >
            <X className="size-4" />
          </Button>
        </div>
        <JobDetailsPanel job={job} />
      </aside>
    </>
  );
}

export const JobMarketPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobFeedItem | null>(null);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState<JobSearchFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<JobSearchFilters>(defaultFilters);

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      try {
        const data = await fetchJobs();
        if (isMounted) {
          setJobs(data.map(mapJobData));
          setLoadError(null);
        }
      } catch (error) {
        console.error("Failed to fetch jobs from /api/jobs:", error);
        if (isMounted) {
          setJobs([]);
          setLoadError("Không thể tải danh sách việc làm từ API jobs.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJobs = useMemo(
    () => filterJobs(jobs, appliedFilters),
    [jobs, appliedFilters]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setSelectedJob(null);
    setIsMobileDetailsOpen(false);
  };

  const handleSelectJob = (job: JobFeedItem) => {
    setSelectedJob(job);
    setIsMobileDetailsOpen(true);
  };

  return (
    <div className="job-market-page min-h-[calc(100vh-var(--topbar-height,72px))] bg-[#090E1A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <JobSearchSection
        filters={draftFilters}
        onFiltersChange={setDraftFilters}
        onSubmit={handleSubmit}
      />

      <section className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-[minmax(320px,40%)_minmax(0,1fr)]">
        <JobList
          jobs={filteredJobs}
          selectedJob={selectedJob}
          isLoading={isLoading}
          loadError={loadError}
          onSelectJob={handleSelectJob}
        />

        <aside className="hidden md:block">
          <div className="sticky top-4">
            <JobDetailsPanel job={selectedJob} />
          </div>
        </aside>
      </section>

      <JobDetailsSlideOver
        job={selectedJob}
        isOpen={isMobileDetailsOpen && !!selectedJob}
        onClose={() => setIsMobileDetailsOpen(false)}
      />
    </div>
  );
};
