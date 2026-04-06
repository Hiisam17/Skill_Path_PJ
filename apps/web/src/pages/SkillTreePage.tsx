import { useSearchParams, useNavigate } from "react-router-dom";
import { SkillList } from "@/features/skill-tree";
import { ArrowLeft } from "lucide-react";

/**
 * SkillTreePage
 * Hiển thị danh sách kỹ năng cho career path được chọn.
 * Đọc careerPathId từ query string: /skill-tree?careerPathId=2
 */
export const SkillTreePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const careerPathId = searchParams.get("careerPathId") ?? "1";

  const handleSkillComplete = async (skillId: string): Promise<void> => {
    console.info("Skill completed:", skillId);
    // TODO: Call POST /skills/:id/complete when API is ready
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#090E1A",
        color: "#f8fafc",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #1F2937",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          background: "#111726",
        }}
      >
        <button
          onClick={() => navigate("/career-paths")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            border: "1px solid #1F2937",
            color: "#94A3B8",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            fontSize: "14px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#00BDD6";
            (e.currentTarget as HTMLButtonElement).style.color = "#00E5FF";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#1F2937";
            (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
              color: "#f8fafc",
            }}
          >
            Dev<span style={{ color: "#00E5FF" }}>Path</span>
          </h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#94A3B8" }}>
            Skill Tree — Career Path #{careerPathId}
          </p>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ marginBottom: "32px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#00BDD6",
            }}
          >
            Learning Path
          </span>
          <h2
            style={{
              margin: "8px 0 0",
              fontSize: "36px",
              fontWeight: 800,
              color: "#f8fafc",
              letterSpacing: "-0.5px",
            }}
          >
            Backend Development
          </h2>
          <p style={{ margin: "8px 0 0", color: "#94A3B8", fontSize: "16px" }}>
            Master the skills to build scalable, production-ready backend systems.
          </p>
        </div>

        <SkillList
          roadmapId={careerPathId}
          onSkillComplete={handleSkillComplete}
        />
      </main>
    </div>
  );
};
