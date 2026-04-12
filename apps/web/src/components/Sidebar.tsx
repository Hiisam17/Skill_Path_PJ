import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L10 4l7 6.5" /><path d="M5 9.5V16a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9.5" />
  </svg>
);
const RoadmapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4v12" /><path d="M4 4h6l2 2-2 2H4" /><path d="M4 12h8l2-2-2-2" />
  </svg>
);
const JobMarketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="14" height="10" rx="1.5" /><path d="M7 7V5.5A1.5 1.5 0 018.5 4h3A1.5 1.5 0 0113 5.5V7" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="3" /><path d="M10 1.5v2M10 16.5v2M3.15 3.15l1.42 1.42M15.43 15.43l1.42 1.42M1.5 10h2M16.5 10h2M3.15 16.85l1.42-1.42M15.43 4.57l1.42-1.42" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3h3a1 1 0 011 1v12a1 1 0 01-1 1h-3" /><path d="M10 10H3m0 0l3-3m-3 3l3 3" />
  </svg>
);

const navItems = [
  { path: "/dashboard", label: "Home", icon: <HomeIcon /> },
  { path: "/frontend-roadmap", label: "Roadmap", icon: <RoadmapIcon /> },
  { path: "/job-market", label: "Job Market", icon: <JobMarketIcon /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <h1>DevPath</h1>
        </div>

        <div className="sidebar-section-label">NAVIGATION</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-bottom-links">
          <a href="#settings">
            <span className="nav-icon"><SettingsIcon /></span>
            Settings
          </a>
          <NavLink to="/">
            <span className="nav-icon"><LogoutIcon /></span>
            Logout
          </NavLink>
        </div>

        <div className="sidebar-user-card">
          <div className="sidebar-avatar">JD</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Architect Navigator</div>
            <div className="sidebar-user-level">Lvl 24 Dev</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
