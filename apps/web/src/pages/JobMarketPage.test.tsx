import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobMarketPage } from "./JobMarketPage";
import { fetchJobs } from "@/services/jobService";
import { analyzeJobJD } from "@/services/gapService";

vi.mock("@/services/jobService", () => ({
  fetchJobs: vi.fn(),
}));

vi.mock("@/services/gapService", () => ({
  analyzeJobJD: vi.fn(),
}));

const mockedFetchJobs = vi.mocked(fetchJobs);
const mockedAnalyzeJobJD = vi.mocked(analyzeJobJD);

function renderJobMarket() {
  return render(
    <MemoryRouter>
      <JobMarketPage />
    </MemoryRouter>,
  );
}

describe("JobMarketPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders job cards from backend job API data", async () => {
    mockedFetchJobs.mockResolvedValue([
      {
        id: 1,
        title: "React Developer",
        company: "Product Co",
        location: "Hồ Chí Minh",
        jobType: "Hybrid",
        description:
          "We are looking for a Frontend Developer with React, TypeScript, REST API and Git.",
        skills: ["React", "TypeScript", "REST API", "Git"],
        roadmapPath: "/roadmaps/Frontend",
        createdAt: "2026-05-27T00:00:00.000Z",
      },
    ]);

    renderJobMarket();

    expect(await screen.findByText("React Developer")).toBeInTheDocument();
    expect(screen.getByText("Product Co")).toBeInTheDocument();
    expect(screen.getByText("Hồ Chí Minh")).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
  });

  it("renders error state when jobs API fails", async () => {
    mockedFetchJobs.mockRejectedValue(new Error("network failed"));

    renderJobMarket();

    expect(
      await screen.findByText("Không thể tải danh sách việc làm từ API jobs."),
    ).toBeInTheDocument();
  });

  it("calls AI analysis API and renders required/missing skill groups", async () => {
    mockedFetchJobs.mockResolvedValue([
      {
        id: 1,
        title: "React Developer",
        company: "Product Co",
        location: "Hà Nội",
        jobType: "Remote",
        description:
          "We are looking for React, TypeScript, REST API, Git, and modern JavaScript.",
        skills: ["React", "TypeScript", "REST API", "Git", "JavaScript"],
        roadmapPath: "/roadmaps/Frontend",
        createdAt: "2026-05-27T00:00:00.000Z",
      },
    ]);
    mockedAnalyzeJobJD.mockResolvedValue({
      seniority: "Junior",
      must_have: ["React", "TypeScript", "REST API"],
      nice_to_have: ["Git", "JavaScript"],
      experience_years: "1",
      ai_advice: "Ôn sâu React và TypeScript trước khi ứng tuyển.",
      roadmapPath: "/roadmaps/Frontend",
    });

    renderJobMarket();

    await userEvent.click(await screen.findByText("React Developer"));
    await userEvent.click(
      screen.getAllByRole("button", { name: "Phân tích JD bằng AI" })[0],
    );

    expect(mockedAnalyzeJobJD).toHaveBeenCalledWith(1);
    expect(await screen.findByText("Must-have Skills")).toBeInTheDocument();
    expect(screen.getAllByText("React").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Ôn sâu React và TypeScript trước khi ứng tuyển."),
    ).toBeInTheDocument();
  });
});
