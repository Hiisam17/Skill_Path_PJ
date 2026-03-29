import { useState } from "react";
import { completeSkill } from "@/services/api";
import type { SkillDto } from "@/types";

interface SkillNodeProps {
  skill: SkillDto;
  onCompleted: (skillId: string) => void;
}

export const SkillNode = ({ skill, onCompleted }: SkillNodeProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isCompleted = skill.status === "COMPLETED";

  const handleMarkCompleted = async (): Promise<void> => {
    if (isCompleted || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await completeSkill(skill.id);
      onCompleted(skill.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to mark skill completed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <li
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "12px",
        backgroundColor: isCompleted ? "#ecfdf5" : "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>{skill.name}</div>
          <div style={{ color: "#4b5563", marginTop: "4px" }}>
            {skill.description}
          </div>
          <div style={{ marginTop: "8px", fontSize: "14px" }}>
            <span style={{ marginRight: "8px" }}>Step {skill.orderIndex}</span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "999px",
                backgroundColor: isCompleted ? "#10b981" : "#f59e0b",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {isCompleted ? "COMPLETED" : "NOT_STARTED"}
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleMarkCompleted}
            disabled={isCompleted || isSubmitting}
            style={{
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              backgroundColor: isCompleted ? "#9ca3af" : "#2563eb",
              color: "#ffffff",
              cursor: isCompleted || isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isCompleted
              ? "Completed"
              : isSubmitting
                ? "Submitting..."
                : "Mark completed"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "#b91c1c", marginTop: "8px", fontSize: "14px" }}>
          {error}
        </div>
      )}
    </li>
  );
};
