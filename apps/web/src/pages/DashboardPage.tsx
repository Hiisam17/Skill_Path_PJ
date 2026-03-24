/**
 * DashboardPage Component
 * Main dashboard showing:
 * - User's learning progress (ProgressBar component)
 * - Skill tree (SkillList component)
 */

import { useState, useEffect } from "react";
import type { ProgressDto } from "@/types";
import { ProgressBar } from "@/components/ProgressBar";
import { SkillList } from "@/components/SkillList";

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
  const [roadmapId, setRoadmapId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        setProgress(null);
        setRoadmapId("");
        // TODO: Fetch user progress from GET /users/progress
        // const response = await api.get<ProgressDto>('/users/progress');
        // setProgress(response.data);

        // TODO: Get roadmapId from somewhere (AuthContext? localStorage? user's selected roadmap)
        // const savedRoadmapId = localStorage.getItem('selectedRoadmapId');
        // if (savedRoadmapId) {
        //   setRoadmapId(savedRoadmapId);
        // }
        throw new Error("Not implemented");
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
      // TODO: Call POST /skills/:id/complete
      // await api.post(`/skills/${skillId}/complete`, {});
      // TODO: Refresh progress
      // const response = await api.get<ProgressDto>('/users/progress');
      // setProgress(response.data);
      throw new Error("Not implemented");
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
    <div>
      <h1>Dashboard</h1>

      {progress && (
        <ProgressBar
          completed={progress.completedSkills}
          total={progress.totalSkills}
        />
      )}

      {roadmapId && (
        <SkillList
          roadmapId={roadmapId}
          onSkillComplete={handleSkillComplete}
        />
      )}

      {!roadmapId && <p>No roadmap selected</p>}
    </div>
  );
};
