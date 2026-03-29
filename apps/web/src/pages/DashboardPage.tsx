/**
 * DashboardPage Component
 * Main dashboard showing:
 * - User's learning progress (ProgressBar component)
 * - Skill tree (SkillTree component with roadmap.sh-style visualization)
 */

import { useState, useEffect } from "react";
import type { ProgressDto, SkillDto } from "@/types";
import { ProgressBar } from "@/components/ProgressBar";
import { SkillTree } from "@/components/SkillTree";

/**
 * DashboardPage Component
 * Displays user progress and skills for current roadmap
 * Combines ProgressBar and SkillList components
 *
 * TODO: Get roadmapId from user's selected roadmap stored somewhere
 * TODO: Fetch GET /users/progress for progress data
 *
 * @returns {JSX.Element} Dashboard with progress bar and skill list
 */
export const DashboardPage = () => {
  const [progress, setProgress] = useState<ProgressDto | null>(null);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Fetch user progress from GET /users/progress
        // const response = await api.get<ProgressDto>('/users/progress');
        // setProgress(response.data);
        setProgress({
          completedSkills: 0,
          totalSkills: 6,
          percentage: 0,
        });

        // Hardcoded demo skills (matches seed data)
        setSkills([
          {
            id: "11111111-1111-1111-1111-111111111111",
            roadmapId: "77777777-7777-7777-7777-777777777777",
            name: "Git",
            description: "Version control basics",
            orderIndex: 1,
            status: "NOT_STARTED",
          },
          {
            id: "22222222-2222-2222-2222-222222222222",
            roadmapId: "77777777-7777-7777-7777-777777777777",
            name: "Linux",
            description: "Command line fundamentals",
            orderIndex: 2,
            status: "NOT_STARTED",
          },
          {
            id: "33333333-3333-3333-3333-333333333333",
            roadmapId: "77777777-7777-7777-7777-777777777777",
            name: "JavaScript",
            description: "Programming language",
            orderIndex: 3,
            status: "NOT_STARTED",
          },
          {
            id: "44444444-4444-4444-4444-444444444444",
            roadmapId: "77777777-7777-7777-7777-777777777777",
            name: "Node.js",
            description: "Server-side JavaScript",
            orderIndex: 4,
            status: "NOT_STARTED",
          },
          {
            id: "55555555-5555-5555-5555-555555555555",
            roadmapId: "77777777-7777-7777-7777-777777777777",
            name: "Database",
            description: "Data storage and queries",
            orderIndex: 5,
            status: "NOT_STARTED",
          },
          {
            id: "66666666-6666-6666-6666-666666666666",
            roadmapId: "77777777-7777-7777-7777-777777777777",
            name: "REST API",
            description: "Web service design",
            orderIndex: 6,
            status: "NOT_STARTED",
          },
        ]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleSkillComplete = async (skillId: string): Promise<void> => {
    try {
      console.info("Marking skill complete:", skillId);
      // Update local state immediately for demo
      setSkills((prevSkills) =>
        prevSkills.map((skill) =>
          skill.id === skillId ? { ...skill, status: "COMPLETED" } : skill
        )
      );
      // TODO: Call POST /skills/:id/complete when backend endpoint is ready
      // await api.post(`/skills/${skillId}/complete`, {});
      // TODO: Refresh progress
      // const response = await api.get<ProgressDto>('/users/progress');
      // setProgress(response.data);
    } catch (err) {
      console.error("Failed to mark skill complete:", err);
    }
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#0f172a", margin: "0 0 0.5rem 0" }}>
          Learning Dashboard
        </h1>
        <p style={{ color: "#475569", fontSize: "1.1rem" }}>Track your progress and master new skills</p>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          Error: {error}
        </div>
      )}

      {!isLoading && progress && (
        <>
          <div style={{ marginBottom: "2rem" }}>
            <ProgressBar
              completed={progress.completedSkills}
              total={progress.totalSkills}
            />
          </div>

          {skills.length > 0 && (
            <SkillTree
              skills={skills}
              onMarkComplete={handleSkillComplete}
            />
          )}
        </>
      )}
    </div>
  );
};
