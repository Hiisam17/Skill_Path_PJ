import { useEffect, useState } from "react";
import type { SkillDto } from "@/types";
import { api, completeSkill } from "@/services/api";
import { BACKEND_ROADMAP_MOCK } from "../data/mockBackendRoadmap";
import type { SkillNodeUI } from "../data/mockBackendRoadmap";
import SkillDetailDrawer from "./SkillDetailDrawer";
import "./SkillTree.css";

function ConnectionLine() {
  return (
    <div className="roadmap-timeline-bg">
      <div className="roadmap-timeline-line"></div>
    </div>
  );
}

export default function SkillTree() {
  const [skills, setSkills] = useState<SkillNodeUI[]>(BACKEND_ROADMAP_MOCK);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillNodeUI | null>(null);

  useEffect(() => {
    const loadSkills = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const storedRoadmapId = localStorage.getItem("selectedRoadmapId");

        let roadmapId = storedRoadmapId;
        if (!roadmapId) {
          const roadmapsResponse = await api.get<Array<{ id: string }>>("/roadmaps");
          roadmapId = roadmapsResponse.data[0]?.id;
          if (roadmapId) {
            localStorage.setItem("selectedRoadmapId", roadmapId);
          }
        }

        if (!roadmapId) {
          throw new Error("No roadmap found");
        }

        const skillsResponse = await api.get<SkillDto[]>(`/roadmaps/${roadmapId}/skills`);
        const realSkills = skillsResponse.data;

        // Merge real API status into our mock structure for the amazing layout
        setSkills((prevMock) =>
          prevMock.map((mockSkill, index) => {
            // Try to match by index if db ID doesn't align exactly
            const real = realSkills.find(s => s.name.toLowerCase() === mockSkill.name.toLowerCase()) || realSkills[index];
            if (real && real.status) {
              return { ...mockSkill, id: real.id, status: real.status as SkillNodeUI["status"] };
            }
            return mockSkill;
          })
        );
      } catch {
        // We gracefully fallback to the mock data if API fails (like the current 500 error)
        setError("Could not sync with Backend API. Falling back to offline mockup data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSkills();
  }, []);

  const handleStatusChange = async (id: string, newStatus: SkillNodeUI["status"]) => {
    try {
      // Optimistic updatesss
      setSkills(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      if (selectedSkill?.id === id) {
        setSelectedSkill({ ...selectedSkill, status: newStatus });
      }

      if (newStatus === "COMPLETED") {
        await completeSkill(id);
      }
      // Note: Backend doesn't support reverting/changing to IN_PROGRESS via API yet.
      // We rely on optimistic UI updates for now as requested.
    } catch {
      // Keep optimistic update for mockup continuity
    }
  };

  const getStatusClass = (status: SkillNodeUI["status"]) => {
    switch(status) {
      case "COMPLETED": return "roadmap-node-card--completed";
      case "IN_PROGRESS": return "roadmap-node-card--in-progress";
      case "NOT_STARTED": return "roadmap-node-card--not-started";
      case "LOCKED": return "roadmap-node-card--locked";
    }
  };

  return (
    <div className="roadmap-container">
      {error && <div className="roadmap-error-banner">{error}</div>}
      {isLoading && <div className="roadmap-loading-banner">Synching real-time progress...</div>}
      
      <div className="roadmap-header">
        <h2 className="roadmap-header__title">Backend Developer Track</h2>
        <p className="roadmap-header__subtitle">Master servers, databases, architecture and deployment.</p>
      </div>

      <div className="roadmap-path">
        <ConnectionLine />

        <div className="roadmap-nodes">
          {skills.map((skill, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div 
                key={skill.id} 
                className={`roadmap-node-wrapper ${isLeft ? "roadmap-node-wrapper--left" : "roadmap-node-wrapper--right"}`}
              >
                <div className="roadmap-node-connector">
                  <div className={`roadmap-node-dot roadmap-node-dot--${skill.status.toLowerCase()}`}></div>
                  <div className={`roadmap-node-line roadmap-node-line--${skill.status.toLowerCase()}`}></div>
                </div>

                <button 
                  className={`roadmap-node-card ${getStatusClass(skill.status)}`}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <div className="roadmap-node-badge">{skill.category}</div>
                  <h3 className="roadmap-node-title">{skill.name}</h3>
                  <div className="roadmap-node-status">{skill.status.replace("_", " ")}</div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <SkillDetailDrawer 
        skill={selectedSkill} 
        isOpen={!!selectedSkill} 
        onClose={() => setSelectedSkill(null)} 
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
