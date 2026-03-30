import { useEffect, useState } from "react";
import type { SkillDto } from "@/types";
import { SkillNode } from "./SkillNode";

interface SkillListProps {
  roadmapId: string;
  onSkillComplete?: (skillId: string) => Promise<void>;
}

const createMockSkills = (roadmapId: string): SkillDto[] => [
  {
    id: "skill-git",
    roadmapId,
    name: "Git",
    description: "Version control co ban",
    orderIndex: 1,
    status: "NOT_STARTED",
  },
  {
    id: "skill-linux",
    roadmapId,
    name: "Linux",
    description: "Lenh terminal va he dieu hanh",
    orderIndex: 2,
    status: "NOT_STARTED",
  },
  {
    id: "skill-js",
    roadmapId,
    name: "JavaScript",
    description: "Ngon ngu lap trinh nen tang",
    orderIndex: 3,
    status: "NOT_STARTED",
  },
  {
    id: "skill-nodejs",
    roadmapId,
    name: "Node.js",
    description: "JavaScript phia server",
    orderIndex: 4,
    status: "NOT_STARTED",
  },
  {
    id: "skill-db",
    roadmapId,
    name: "Database",
    description: "SQL va co so du lieu",
    orderIndex: 5,
    status: "NOT_STARTED",
  },
  {
    id: "skill-restapi",
    roadmapId,
    name: "REST API",
    description: "Thiet ke va xay dung API",
    orderIndex: 6,
    status: "NOT_STARTED",
  },
];

export const SkillList = ({ roadmapId, onSkillComplete }: SkillListProps) => {
  const [skills, setSkills] = useState<SkillDto[]>([]);

  useEffect(() => {
    setSkills(createMockSkills(roadmapId));
  }, [roadmapId]);

  const handleCompleted = (skillId: string): void => {
    setSkills((currentSkills) =>
      currentSkills.map((skill) =>
        skill.id === skillId ? { ...skill, status: "COMPLETED" } : skill,
      ),
    );

    if (onSkillComplete) {
      onSkillComplete(skillId).catch(() => {
        // Parent callback is optional and may still be a TODO during integration.
      });
    }
  };

  return (
    <section>
      <h2 style={{ marginBottom: "12px" }}>Skills for roadmap {roadmapId}</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {skills.map((skill) => (
          <SkillNode
            key={skill.id}
            skill={skill}
            onCompleted={handleCompleted}
          />
        ))}
      </ul>
    </section>
  );
};
