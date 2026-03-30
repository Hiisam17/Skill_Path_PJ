import "./TopBar.css";

const SearchIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1C8 1 3 4 3 10V14H13V10C13 4 8 1 8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6 14C6 15.1 6.9 16 8 16C9.1 16 10 15.1 10 14" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="13" cy="3" r="2.5" fill="#4cd7f6" stroke="#0b1326" strokeWidth="1"/>
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 1V3M10 17V19M1 10H3M17 10H19M3.22 3.22L4.64 4.64M15.36 15.36L16.78 16.78M3.22 16.78L4.64 15.36M15.36 4.64L16.78 3.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <span className="topbar__search-icon">
          <SearchIcon />
        </span>
        <input
          className="topbar__search-input"
          type="text"
          placeholder="Search skills, technologies..."
        />
      </div>

      <div className="topbar__actions">
        <div className="topbar__icons">
          <button className="topbar__icon-btn" type="button" aria-label="Notifications">
            <BellIcon />
          </button>
          <button className="topbar__icon-btn" type="button" aria-label="Settings">
            <SettingsIcon />
          </button>
        </div>
        <div className="topbar__avatar-wrapper">
          <div className="topbar__avatar">DP</div>
        </div>
      </div>
    </header>
  );
}
