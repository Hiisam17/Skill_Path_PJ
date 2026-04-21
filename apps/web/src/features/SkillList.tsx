/**
 * Renders a list of skills associated with a roadmap.
 * Displays completion status and allows marking skills as complete.
 * Currently uses a standard list layout (visualization features pending).
 */

import { useState, useEffect } from "react";
import type { SkillDto } from "@/types";

interface SkillListProps {
  roadmapId: string;
  onSkillComplete?: (skillId: string) => Promise<void>;
}

/**
 * @param props - The component properties containing roadmap details and completion callback.
 * @returns The rendered list of skills.
 */
export const SkillList = ({
  roadmapId,
  onSkillComplete,
}: SkillListProps) => {
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        setSkills([]);
        // TODO(SkillList): Connect to actual API endpoints for fetching skills once implemented.
        // const response = await api.get<SkillDto[]>(`/roadmaps/${roadmapId}/skills`);
        // setSkills(response.data);
        throw new Error("Not implemented");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load skills";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, [roadmapId]);

  if (isLoading) {
    return <div>Loading skills...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Skills for Roadmap {roadmapId}</h2>
      <ul>
        {skills.map((skill) => (
          <li key={skill.id}>
            <div>
              <strong>{skill.name}</strong> - {skill.description}
            </div>
            <div>
              Order: {skill.orderIndex}, Status: {skill.status || "NOT_STARTED"}
            </div>
            <button
              onClick={() => onSkillComplete?.(skill.id)}
              disabled={skill.status === "COMPLETED"}
            >
              {skill.status === "COMPLETED" ? "Completed" : "Mark completed"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
