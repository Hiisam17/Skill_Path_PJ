import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "./profile/ProfileModal";
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

const UserEditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3h3a1 1 0 011 1v12a1 1 0 01-1 1h-3" /><path d="M10 10H3m0 0l3-3m-3 3l3 3" />
  </svg>
);

const navItems = [
  { path: "/dashboard", label: "Home", icon: <HomeIcon /> },
  { path: "/explore", label: "Roadmap", icon: <RoadmapIcon /> },
  { path: "/job-market", label: "Job Market", icon: <JobMarketIcon /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <NavLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>DevPath</h1>
          </NavLink>
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
          <a href="#" onClick={(e) => {
            e.preventDefault();
            setIsProfileModalOpen(true);
          }}>
            <span className="nav-icon"><UserEditIcon /></span>
            Edit Profile
          </a>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            logout();
          }}>
            <span className="nav-icon"><LogoutIcon /></span>
            Logout
          </a>
        </div>

        <div className="sidebar-user-card">
          <div className="sidebar-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName || "User"} />
            ) : (
              (user?.fullName || user?.email || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user?.fullName || user?.email?.split("@")[0] || "User"}
            </div>
            <div className="sidebar-user-level">{user?.bio || "Học viên xuất sắc"}</div>
          </div>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </aside>
  );
}
