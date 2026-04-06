import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const SkillTreeIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="10" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="2" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 7V3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 12.5L3.5 15" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 12.5L16.5 15" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const navItems = [
  { path: "/skills-tree", label: "Skill Tree", icon: <SkillTreeIcon /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">DevPath</div>
        <div className="sidebar__tagline">Architect Navigator</div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__cta" type="button">Level Up</button>
      </div>
    </aside>
  );
}
