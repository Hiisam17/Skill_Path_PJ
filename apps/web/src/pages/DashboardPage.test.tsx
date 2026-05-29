import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import { api } from "@/services/api";

vi.mock("@/services/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      fullName: "Test User",
    },
  }),
}));

vi.mock("@/components/milestones/MilestonesModal", () => ({
  default: () => null,
}));

const mockedApi = vi.mocked(api, true);

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

function mockDashboardRequests({
  progress,
  progressReject = false,
}: {
  progress?: unknown;
  progressReject?: boolean;
}) {
  mockedApi.post.mockResolvedValue({ data: {} });
  mockedApi.get.mockImplementation((url: string) => {
    if (url.startsWith("/dashboard/stats")) {
      return Promise.resolve({
        data: {
          streakData: {
            currentStreak: 3,
            longestStreak: 5,
            lastActivityAt: null,
          },
          unlockedMilestones: [],
        },
      });
    }

    if (url === "/users/progress") {
      if (progressReject) return Promise.reject(new Error("progress failed"));
      return Promise.resolve({ data: progress });
    }

    if (url === "/jobs/trends") {
      return Promise.resolve({
        data: {
          generatedAt: "2026-05-27T00:00:00.000Z",
          periodDays: 30,
          basis: "recent_period",
          topSkills: [
            {
              name: "TypeScript",
              currentCount: 4,
              previousCount: 2,
              growthPct: 100,
              demandShare: 40,
              trend: "up",
            },
          ],
          sparkline: [{ date: "2026-05-27", jobCount: 2 }],
        },
      });
    }

    return Promise.reject(new Error(`Unhandled API call: ${url}`));
  });
}

describe("DashboardPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows loading state while dashboard requests are pending", () => {
    mockedApi.post.mockReturnValue(new Promise(() => undefined));

    renderDashboard();

    expect(screen.getByText("LOADING")).toBeInTheDocument();
  });

  it("renders empty state when the user has no active roadmaps", async () => {
    mockDashboardRequests({
      progress: {
        overall: { completedSkills: 0, totalSkills: 0, percentage: 0 },
        roadmaps: [],
      },
    });

    renderDashboard();

    expect(
      await screen.findByText("You haven't started any roadmaps yet."),
    ).toBeInTheDocument();
    expect(screen.getByText("30d Job Demand")).toBeInTheDocument();
  });

  it("renders progress and active roadmap cards from backend data", async () => {
    mockDashboardRequests({
      progress: {
        overall: { completedSkills: 4, totalSkills: 8, percentage: 50 },
        roadmaps: [
          {
            roadmapId: "frontend",
            roadmapName: "Frontend Developer",
            completedSkills: 4,
            totalSkills: 8,
            percentage: 50,
          },
        ],
      },
    });

    renderDashboard();

    expect((await screen.findAllByText("50%")).length).toBeGreaterThan(0);
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("4 / 8 skills")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders an error state when progress API fails and no local fallback exists", async () => {
    mockDashboardRequests({ progressReject: true });

    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load roadmap progress",
    );
  });

  it("calls the market trends endpoint from the dashboard load", async () => {
    mockDashboardRequests({
      progress: {
        overall: { completedSkills: 0, totalSkills: 0, percentage: 0 },
        roadmaps: [],
      },
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/jobs/trends", {
        params: { periodDays: 30, limit: 3 },
      });
    });
  });
});
