import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DashboardPage.css";

/* ── Types ── */
interface ProgressData {
  completedSkills: number;
  totalSkills: number;
  percentage: number;
}

/* ── SVG Icon Components ── */
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
const SkillTreeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="4" r="2" /><circle cx="5" cy="14" r="2" /><circle cx="15" cy="14" r="2" /><path d="M10 6v4M10 10l-5 2M10 10l5 2" />
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
const ArrowUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 12V2M3 5l4-3 4 3" />
  </svg>
);

/* ── Sparkline Data ── */
const sparklinePoints = [
  0, 15, 12, 30, 25, 45, 40, 55, 50, 65, 58, 70, 62, 80, 75, 90, 82, 95, 88, 78, 85, 92, 88, 96, 90, 85, 92, 88, 95, 92
];

function generateSparklinePath(points: number[], width: number, height: number): { line: string; area: string } {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const padding = 8;
  const effectiveHeight = height - padding * 2;
  const stepX = width / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: i * stepX,
    y: padding + effectiveHeight - ((p - min) / range) * effectiveHeight,
  }));

  // Create smooth curve using cubic bezier
  let line = `M${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx1 = prev.x + stepX * 0.4;
    const cpx2 = curr.x - stepX * 0.4;
    line += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
  }

  const area = `${line} L${coords[coords.length - 1].x},${height} L${coords[0].x},${height} Z`;

  return { line, area };
}

/* ── Circular Progress Ring ── */
const ProgressRing: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 112;
  const center = 128;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring-container">
      <svg className="progress-ring-svg" viewBox="0 0 256 256">
        <circle className="progress-ring-bg" cx={center} cy={center} r={radius} />
        <circle
          className="progress-ring-fg"
          cx={center}
          cy={center}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-ring-value">{percentage}%</span>
        <span className="progress-ring-sublabel">ROADMAP DONE</span>
      </div>
    </div>
  );
};

/* ── Main Dashboard Page ── */
export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/progress");
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        console.error("Lỗi khi tải tiến độ:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, []);

  /* ── Skills data (Chuyển lên đầu để tránh lỗi sử dụng trước khi khai báo) ── */
  const [localSkills, setLocalSkills] = useState([
    { id: 1, icon: "◈", title: "GraphQL Mastery", desc: "Optimize your API layer with typed queries", xp: 200, isCompleted: false },
    { id: 2, icon: "🔐", title: "Auth Patterns", desc: "Implement OAuth2, JWT, and WebAuthn", xp: 350, isCompleted: false },
    { id: 3, icon: "⚡", title: "Serverless Edge", desc: "Deploying functions globally with low latency", xp: 150, isCompleted: false },
    { id: 4, icon: "🧩", title: "Micro-Frontends", desc: "Scaling UI development across distributed teams", xp: 500, isCompleted: false },
  ]);

  /* ── Xử lý Click Hoàn thành Skill (Optimistic Update) ── */
  const handleCompleteSkill = async (skillId: number) => {
    // 1. TẠO BACKUP: Lưu lại trạng thái cũ phòng khi API xịt
    const previousProgress = progress;
    const previousSkills = [...localSkills];

    // 2. OPTIMISTIC UPDATE: Cập nhật UI NGAY LẬP TỨC
    // Đổi màu nút thành "Completed"
    setLocalSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, isCompleted: true } : s
    ));
    // Tăng vòng tròn phần trăm lên ngay tắp lự
    if (progress) {
      setProgress({
        ...progress,
        completedSkills: progress.completedSkills + 1
      });
    }

    // 3. GỌI API CHẠY NGẦM
    try {
      const response = await fetch(`http://localhost:3000/skills/${skillId}/complete`, {
        method: 'POST', // Chỉnh lại cho đúng method bạn viết bên BE
      });

      if (!response.ok) throw new Error("API lỗi");

      // Thành công thì không cần làm gì thêm vì UI đã cập nhật từ bước 2 rồi!

    } catch (error) {
      console.error("Lỗi khi lưu tiến độ:", error);
      
      // 4. ROLLBACK: Nếu mạng lag hoặc API lỗi, khôi phục lại UI ban đầu
      setProgress(previousProgress);
      setLocalSkills(previousSkills);
      alert("Lỗi kết nối! Vui lòng thử lại."); // Trong thực tế nên dùng thư viện Toast (như react-hot-toast) cho đẹp
    }
  };

  const progressPercentage = progress
    ? Math.round((progress.completedSkills / progress.totalSkills) * 100)
    : 65;

  // Sparkline path
  const { line: sparkLine, area: sparkArea } = generateSparklinePath(sparklinePoints, 800, 96);

  /* ── Navigation items ── */
  const navItems = [
    { path: "/dashboard", label: "Home", icon: <HomeIcon /> },
    { path: "/roadmap", label: "Roadmap", icon: <RoadmapIcon /> },
    { path: "/career-paths", label: "Skill Tree", icon: <SkillTreeIcon /> },
    { path: "/job-market", label: "Job Market", icon: <JobMarketIcon /> },
  ];

  /* ── Milestones ── */
  const milestones = [
    { icon: "🚀", label: "First Step", variant: "unlocked-cyan" as const },
    { icon: "🌱", label: "Beginner", variant: "unlocked-purple" as const },
    { icon: "🧭", label: "Explorer", variant: "unlocked-orange" as const },
    { icon: "🏛️", label: "Architect", variant: "locked" as const },
  ];

  /* ── Market data ── */
  const marketStats = [
    { name: "TypeScript", value: "+14.2%", color: "cyan" as const },
    { name: "Rust", value: "+8.7%", color: "purple" as const },
    { name: "Next.js", value: "+22.5%", color: "orange" as const },
  ];

  return (
    <div className="dashboard-layout">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <h1>DevPath</h1>
          </div>

          <div className="sidebar-section-label">NAVIGATION</div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-links">
            <a href="#settings">
              <span className="nav-icon"><SettingsIcon /></span>
              Settings
            </a>
            <Link to="/">
              <span className="nav-icon"><LogoutIcon /></span>
              Logout
            </Link>
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

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* ── Header ── */}
          <header className="dashboard-header">
            <div className="dashboard-header-left">
              <h2>Dashboard</h2>
              <p>Welcome back, Architect. Your next milestone is 1.2k XP away.</p>
            </div>
            <div className="streak-badge">
              <span>🔥</span>
              <span>18 Day Streak</span>
            </div>
          </header>

          {/* ── Bento Grid ── */}
          <div className="bento-grid">
            {/* Card A – Progress Overview */}
            <div className="bento-card card-progress">
              <span className="card-progress-label">PROGRESS OVERVIEW</span>
              {isLoading ? (
                <ProgressRing percentage={0} />
              ) : (
                <ProgressRing percentage={progressPercentage} />
              )}
              <div className="card-progress-bottom">
                <span className="card-progress-bottom-left">Current Roadmap: Fullstack Architect</span>
                <span className="card-progress-bottom-right">Lvl 4/6</span>
              </div>
            </div>

            {/* Card B – Earned Milestones */}
            <div className="bento-card card-milestones">
              <div className="card-header">
                <span className="card-header-label">EARNED MILESTONES</span>
                <a href="#milestones" className="card-header-link">View All</a>
              </div>
              <div className="milestones-row">
                {milestones.map((m) => (
                  <div key={m.label} className={`milestone-badge ${m.variant}`}>
                    <div className="milestone-icon-circle">{m.icon}</div>
                    <span className="milestone-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card C – Market Trends */}
            <div className="bento-card card-market">
              <div className="market-header">
                <span className="card-header-label">MARKET TRENDS</span>
                <span className="market-live-dot" />
                <span className="market-live-text">Live Market Data</span>
              </div>
              <div className="market-stats-grid">
                {marketStats.map((stat) => (
                  <div key={stat.name} className={`market-stat-card ${stat.color}`}>
                    <div className="market-stat-name">{stat.name}</div>
                    <div className="market-stat-value">
                      <span>{stat.value}</span>
                      <ArrowUpIcon />
                    </div>
                  </div>
                ))}
              </div>
              <div className="sparkline-container">
                <svg className="sparkline-svg" viewBox="0 0 800 96" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path d={sparkArea} fill="url(#sparkGrad)" />
                  <path d={sparkLine} fill="none" stroke="#4cd7f6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Recommended Skills ── */}
          <section className="skills-section">
            <div className="skills-section-header">
              <div className="skills-section-header-left">
                <span className="section-label">UP NEXT</span>
                <h3>Recommended Skills</h3>
              </div>
              <Link to="/career-paths" className="explore-tree-btn">
                Explore Tree
              </Link>
            </div>

            <div className="skills-grid">
              {localSkills.map((skill) => (
                <div key={skill.id} className="skill-card">
                  <div className="skill-card-icon">{skill.icon}</div>
                  <h4 className="skill-card-title">{skill.title}</h4>
                  <p className="skill-card-desc">{skill.desc}</p>
                  <div className="skill-card-bottom">
                    <span className="skill-xp-badge">{skill.xp} XP</span>
                    <button 
                      onClick={() => handleCompleteSkill(skill.id)}
                      disabled={skill.isCompleted}
                      className={`skill-start-btn transition-all duration-300 ${
                        skill.isCompleted 
                          ? "bg-[#4cd7f6] text-[#171f33] opacity-80 cursor-not-allowed font-bold" 
                          : ""
                      }`}
                    >
                      {skill.isCompleted ? "✓ Completed" : "Start"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <footer className="dashboard-footer">
          <div className="footer-links">
            <a href="#privacy">PRIVACY POLICY</a>
            <a href="#terms">TERMS OF SERVICE</a>
            <a href="#support">SUPPORT</a>
          </div>
          <p className="footer-copyright">© 2024 DevPath. The Architectural Navigator.</p>
        </footer>
      </main>
    </div>
  );
};