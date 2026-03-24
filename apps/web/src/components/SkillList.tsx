/**
 * SkillList Component
 * Displays list of skills for a roadmap with completion status
 * Plain React list (no D3.js visualization yet)
 *
 * Props:
 * - roadmapId: ID of the roadmap to load skills for
 * - onSkillComplete: Callback when user marks a skill as completed
 */

import { useState, useEffect } from "react";
import type { SkillDto } from "@/types";

interface SkillListProps {
  roadmapId: string;
  onSkillComplete?: (skillId: string) => Promise<void>;
}

/**
 * SkillList Component
 * Fetches and renders skills for a specific roadmap
 * Each skill shows: name, description, orderIndex, status
 * User can click "Mark completed" button to trigger completion
 *
 * @param {SkillListProps} props - Component props
 * @returns {JSX.Element} Skill list with complete buttons
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
        // TODO: Fetch skills from GET /roadmaps/:id/skills
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
