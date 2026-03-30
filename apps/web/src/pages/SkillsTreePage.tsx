import { SkillTree } from "@/features/skill-tree";
import StatsPanel from "@/components/StatsPanel";
import "./SkillsTreePage.css";
export const SkillsTreePage = () => {
  return (
    <div className="skill-tree-page">
      <div className="skill-tree-page__glow-top" />
      <div className="skill-tree-page__glow-bottom" />

      <div className="skill-tree-page__header">
        <h1 className="skill-tree-page__title">IT Career Skill Tree Odyssey</h1>
        <p className="skill-tree-page__subtitle">
          Architect your journey from fundamentals to mastery. Navigate through
          specialized branches and unlock your potential.
        </p>
      </div>

      <SkillTree />
      <StatsPanel />
    </div>
  );
};
