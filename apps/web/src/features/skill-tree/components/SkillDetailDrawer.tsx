import type { SkillNodeUI } from "../data/mockBackendRoadmap";
import "./SkillDetailDrawer.css";

interface SkillDetailDrawerProps {
  skill: SkillNodeUI | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: SkillNodeUI["status"]) => void;
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArticleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 7H17M7 11H17M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 10L20 7V17L15 14V17C15 18.1046 14.1046 19 13 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H13C14.1046 5 15 5.89543 15 7V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CourseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14L22 9L12 4L2 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 11L12 16L21.5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 14L12 19L21.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const statusMap = {
  COMPLETED: { label: "Completed", colorClass: "badge-completed" },
  IN_PROGRESS: { label: "In Progress", colorClass: "badge-in-progress" },
  NOT_STARTED: { label: "Not Started", colorClass: "badge-not-started" },
  LOCKED: { label: "Locked", colorClass: "badge-locked" },
};

export default function SkillDetailDrawer({ skill, isOpen, onClose, onStatusChange }: SkillDetailDrawerProps) {
  if (!isOpen || !skill) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const statusConfig = statusMap[skill.status];

  return (
    <div className="drawer-overlay" onClick={handleBackdropClick}>
      <div className={`drawer-panel ${isOpen ? "drawer-panel--open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-header__info">
            <span className="drawer-header__subtitle">{skill.category}</span>
            <h2 className="drawer-header__title">{skill.name}</h2>
            <div className={`drawer-badge ${statusConfig.colorClass}`}>
              {statusConfig.label}
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="drawer-content">
          <section className="drawer-section">
            <h3 className="drawer-section__title">Overview</h3>
            <p className="drawer-section__desc">{skill.description}</p>
          </section>

          {skill.resources && skill.resources.length > 0 && (
            <section className="drawer-section">
              <h3 className="drawer-section__title">Learning Resources</h3>
              <ul className="resource-list">
                {skill.resources.map((resource) => (
                  <li key={resource.id}>
                    <a href={resource.url} target="_blank" rel="noreferrer" className="resource-card">
                      <div className="resource-card__icon">
                        {resource.type === "article" && <ArticleIcon />}
                        {resource.type === "video" && <VideoIcon />}
                        {resource.type === "course" && <CourseIcon />}
                      </div>
                      <div className="resource-card__info">
                        <div className="resource-card__title">{resource.title}</div>
                        <div className="resource-card__type">{resource.type}</div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="drawer-footer">
          {skill.status !== "LOCKED" && (
            <div className="drawer-status-actions">
              <p className="drawer-status-trigger-title">Change Status:</p>
              <div className="drawer-status-buttons">
                <button 
                  className={`drawer-action-btn ${skill.status === 'NOT_STARTED' ? 'drawer-action-btn--active drawer-action-btn--orange' : ''}`}
                  onClick={() => onStatusChange(skill.id, 'NOT_STARTED')}
                >
                  Not Started
                </button>
                <button 
                  className={`drawer-action-btn ${skill.status === 'IN_PROGRESS' ? 'drawer-action-btn--active drawer-action-btn--purple' : ''}`}
                  onClick={() => onStatusChange(skill.id, 'IN_PROGRESS')}
                >
                  In Progress
                </button>
                <button 
                  className={`drawer-action-btn ${skill.status === 'COMPLETED' ? 'drawer-action-btn--active drawer-action-btn--cyan' : ''}`}
                  onClick={() => onStatusChange(skill.id, 'COMPLETED')}
                >
                  Completed
                </button>
              </div>
            </div>
          )}
          {skill.status === "LOCKED" && (
            <div className="drawer-status-text drawer-status-text--muted">
              Complete previous skills to unlock.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
