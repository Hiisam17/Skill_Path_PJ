import "./StatsPanel.css";

const TrophyIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H16V9C16 12.3 13.3 15 10 15C6.7 15 4 12.3 4 9V2Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 5H1V8C1 9.7 2.3 11 4 11" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 5H19V8C19 9.7 17.7 11 16 11" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 15V18M7 18H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1L1 12H8L7 19L15 8H8L9 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1L12.5 7H19L13.5 11L15.5 18L10 14L4.5 18L6.5 11L1 7H7.5L10 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4H7M4.5 1.5L7 4L4.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function StatsPanel() {
  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-card__header">
          <span className="stat-card__icon"><TrophyIcon /></span>
          <span className="stat-card__badge stat-card__badge--cyan">Rank: Associate</span>
        </div>
        <div className="stat-card__label">Total Progress</div>
        <div className="stat-card__value">
          <span className="stat-card__value-main">42</span>
          <span className="stat-card__value-sub">/ 120 Skills</span>
        </div>
        <div className="stat-card__progress">
          <div className="stat-card__progress-fill" style={{ width: "35%" }} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__header">
          <span className="stat-card__icon"><BoltIcon /></span>
          <span className="stat-card__badge stat-card__badge--purple">2x Multiplier</span>
        </div>
        <div className="stat-card__label">Current XP</div>
        <div className="stat-card__value">
          <span className="stat-card__value-main">12,450</span>
        </div>
        <div className="stat-card__hint">
          Earn 500 more XP to unlock Microservices.
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__header">
          <span className="stat-card__icon"><StarIcon /></span>
          <span className="stat-card__badge stat-card__badge--orange">New Badge</span>
        </div>
        <div className="stat-card__label">Active Path</div>
        <div className="stat-card__value-path">Full-Stack Architect</div>
        <div className="stat-card__action">
          <span className="stat-card__action-text">View roadmap details</span>
          <span className="stat-card__action-arrow"><ArrowRightIcon /></span>
        </div>
      </div>
    </div>
  );
}
