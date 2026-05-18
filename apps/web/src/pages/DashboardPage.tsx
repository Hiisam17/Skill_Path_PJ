import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import MilestonesModal from "@/components/milestones/MilestonesModal";

/* ── Types ── */
interface RoadmapProgress {
  roadmapId: string;
  roadmapName: string;
  completedSkills: number;
  totalSkills: number;
  percentage: number;
}

interface MultiProgress {
  overall: {
    completedSkills: number;
    totalSkills: number;
    percentage: number;
  };
  roadmaps: RoadmapProgress[];
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
}

interface MilestoneData {
  id: number;
  name: string;
  icon: string;
  description: string;
}

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
const ProgressRing: React.FC<{ percentage: number; label?: string }> = ({ percentage, label }) => {
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
        <span className="progress-ring-sublabel">{label || "OVERALL"}</span>
      </div>
    </div>
  );
};

/* ── Roadmap accent color helper ── */
const ROADMAP_COLORS = [
  { accent: "var(--accent-cyan)", bg: "rgba(76, 215, 246, 0.12)", border: "rgba(76, 215, 246, 0.3)" },
  { accent: "var(--accent-purple)", bg: "rgba(192, 193, 255, 0.12)", border: "rgba(192, 193, 255, 0.3)" },
  { accent: "var(--accent-orange)", bg: "rgba(255, 184, 115, 0.12)", border: "rgba(255, 184, 115, 0.3)" },
  { accent: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.3)" },
  { accent: "#f472b6", bg: "rgba(244, 114, 182, 0.12)", border: "rgba(244, 114, 182, 0.3)" },
];

const ROADMAP_ICONS = ["🗺️", "🛤️", "🧭", "🚀", "⚡"];

/* ── Main Dashboard Page ── */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [multiProgress, setMultiProgress] = useState<MultiProgress | null>(null);
  const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState<number | null>(null); // null = overall
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [marketStats, setMarketStats] = useState<any[]>([]);
  
   // Gamification State
  const [streakData, setStreakData] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActivityAt: null });
  const [unlockedMilestones, setUnlockedMilestones] = useState<MilestoneData[]>([]);
  const [isMilestonesModalOpen, setIsMilestonesModalOpen] = useState(false);

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);

      const localRoadmaps: RoadmapProgress[] = [];

      // Khôi phục logic đọc localStorage
      try {
        const saved = localStorage.getItem("frontendRoadmapProgress");
        if (saved) {
          const statuses = JSON.parse(saved);
          const completedSkills = Object.values(statuses).filter(s => s === "COMPLETED").length;
          const totalSkills = Math.max(Object.keys(statuses).length, 9);
          if (Object.keys(statuses).length > 0) {
            localRoadmaps.push({
              roadmapId: "local-frontend",
              roadmapName: "Frontend Developer",
              completedSkills,
              totalSkills,
              percentage: Math.round((completedSkills / totalSkills) * 100),
            });
          }
        }
      } catch { /* ignore */ }

      try {
        const saved = localStorage.getItem("jsRoadmapProgress");
        if (saved) {
          const statuses: Record<string, string> = JSON.parse(saved);
          const entries = Object.values(statuses);
          const completedSkills = entries.filter(s => s === "completed").length;
          const inProgressSkills = entries.filter(s => s === "in-progress").length;
          const totalSkills = Math.max(entries.length, 130);
          if (completedSkills > 0 || inProgressSkills > 0) {
            localRoadmaps.push({
              roadmapId: "local-javascript",
              roadmapName: "JavaScript",
              completedSkills,
              totalSkills,
              percentage: Math.round((completedSkills / totalSkills) * 100),
            });
          }
        }
      } catch { /* ignore */ }

      try {
        // BƯỚC 1: Gọi API điểm danh
        await api.post(`/dashboard/activity/${userId}`);
        
        const pStats = api.get(`/dashboard/stats/${userId}`);
        const pProgress = api.get("/users/progress");
        const pMarket = Promise.resolve([
          { name: "TypeScript", value: "+14.2%", color: "cyan" as const },
          { name: "Rust", value: "+8.7%", color: "purple" as const },
          { name: "Next.js", value: "+22.5%", color: "orange" as const },
        ]);

        const results = await Promise.allSettled([pStats, pProgress, pMarket]);

        // Handle Gamification Stats
        if (results[0].status === "fulfilled") {
          setStreakData(results[0].value.data.streakData);
          setUnlockedMilestones(results[0].value.data.unlockedMilestones);
        }

        // Handle Progress & Merge with Local
        if (results[1].status === "fulfilled") {
          const data: MultiProgress = results[1].value.data;
          for (const lr of localRoadmaps) {
            if (lr.completedSkills > 0) {
              const nameKey = lr.roadmapName.toLowerCase();
              const alreadyInApi = data.roadmaps.some(r => r.roadmapName.toLowerCase().includes(nameKey));
              if (!alreadyInApi) {
                data.roadmaps.push(lr);
                data.overall.completedSkills += lr.completedSkills;
                data.overall.totalSkills += lr.totalSkills;
              }
            }
          }
          if (data.overall.totalSkills > 0) {
            data.overall.percentage = Math.round((data.overall.completedSkills / data.overall.totalSkills) * 100);
          }
          setMultiProgress(data);
        } else if (localRoadmaps.length > 0) {
          const totalCompleted = localRoadmaps.reduce((s, r) => s + r.completedSkills, 0);
          const totalSkills = localRoadmaps.reduce((s, r) => s + r.totalSkills, 0);
          setMultiProgress({
            overall: {
              completedSkills: totalCompleted,
              totalSkills,
              percentage: totalSkills > 0 ? Math.round((totalCompleted / totalSkills) * 100) : 0,
            },
            roadmaps: localRoadmaps,
          });
        }

        // Handle Market Stats
        if (results[2].status === "fulfilled") {
          setMarketStats(results[2].value);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);




  /* ── Determine what to show in the ring ── */
  const activeDisplay = (() => {
    if (!multiProgress) return { percentage: 0, label: "OVERALL", name: "Loading..." };
    if (selectedRoadmapIdx === null) {
      return {
        percentage: multiProgress.overall.percentage,
        label: "OVERALL",
        name: `${multiProgress.roadmaps.length} Roadmap${multiProgress.roadmaps.length !== 1 ? "s" : ""} Active`,
      };
    }
    const rm = multiProgress.roadmaps[selectedRoadmapIdx];
    return {
      percentage: rm.percentage,
      label: "ROADMAP",
      name: rm.roadmapName,
    };
  })();

  const { line: sparkLine, area: sparkArea } = generateSparklinePath(sparklinePoints, 800, 96);

  /* ── Milestones & Market Stats are now managed via state ── */

  return (
    <div className="dashboard-layout">

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* ── Header ── */}
          <header className="dashboard-header">
            <div className="dashboard-header-left">
              <h2>Dashboard</h2>
              <p>Welcome back, {user?.fullName || "Architect"}. Let's continue your learning journey.</p>
            </div>
            <div className="streak-badge">
              <span>🔥</span>
              <span>{streakData.currentStreak} Day Streak</span>
            </div>
          </header>

          {/* ── Bento Grid ── */}
          <div className="bento-grid">
            {/* Card A – Progress Overview */}
            <div className="bento-card card-progress">
              <span className="card-progress-label">PROGRESS OVERVIEW</span>
              {isLoading ? (
                <ProgressRing percentage={0} label="LOADING" />
              ) : (
                <ProgressRing percentage={activeDisplay.percentage} label={activeDisplay.label} />
              )}
              <div className="card-progress-bottom">
                <span className="card-progress-bottom-left">{activeDisplay.name}</span>
                <button
                  className="card-progress-overall-btn"
                  onClick={() => setSelectedRoadmapIdx(null)}
                  style={{ opacity: selectedRoadmapIdx === null ? 0.5 : 1 }}
                >
                  Show Overall
                </button>
              </div>
            </div>

            {/* Card B – Earned Milestones */}
            <div className="bento-card card-milestones">
              <div className="card-header">
                <span className="card-header-label">EARNED MILESTONES</span>
                <button 
                  onClick={() => setIsMilestonesModalOpen(true)} 
                  className="card-header-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  View All
                </button>
              </div>
              <div className="milestones-row">
                {unlockedMilestones.length > 0 ? (
                  unlockedMilestones.map((m) => (
                    <div key={m.id} className="milestone-badge unlocked-cyan">
                      <div className="milestone-icon-circle">{m.icon}</div>
                      <span className="milestone-label">{m.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic py-4">
                    Bạn chưa có huy hiệu nào. Hãy tiếp tục học tập để mở khóa nhé!
                  </p>
                )}
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

          {/* ── My Roadmaps Section ── */}
          <section className="roadmaps-section">
            <div className="roadmaps-section-header">
              <div className="roadmaps-section-header-left">
                <span className="section-label">MY PROGRESS</span>
                <h3>Active Roadmaps</h3>
              </div>
              <button 
                onClick={() => navigate('/career-paths')} 
                className="explore-tree-btn cursor-pointer"
              >
                Browse Paths
              </button>
            </div>

            {!isLoading && multiProgress && multiProgress.roadmaps.length > 0 ? (
              <div className="roadmaps-cards-grid">
                {multiProgress.roadmaps.map((rm, idx) => {
                  const color = ROADMAP_COLORS[idx % ROADMAP_COLORS.length];
                  const icon = ROADMAP_ICONS[idx % ROADMAP_ICONS.length];
                  const isActive = selectedRoadmapIdx === idx;

                  return (
                    <div
                      key={rm.roadmapId}
                      className={`roadmap-progress-card cursor-pointer ${isActive ? "roadmap-progress-card--active" : ""}`}
                      style={{
                        borderColor: isActive ? color.border : undefined,
                        background: isActive ? color.bg : undefined,
                      }}
                      onClick={() => setSelectedRoadmapIdx(idx)}
                    >
                      <div className="roadmap-card-top">
                        <span className="roadmap-card-icon">{icon}</span>
                        <span
                          className="roadmap-card-pct"
                          style={{ color: color.accent }}
                        >
                          {rm.percentage}%
                        </span>
                      </div>
                      <h4 className="roadmap-card-name">{rm.roadmapName}</h4>
                      <p className="roadmap-card-stats">
                        {rm.completedSkills} / {rm.totalSkills} skills
                      </p>
                      <div className="roadmap-card-bar-track">
                        <div
                          className="roadmap-card-bar-fill"
                          style={{
                            width: `${rm.percentage}%`,
                            background: color.accent,
                          }}
                        />
                      </div>
                      <button 
                        className={`mt-4 w-full text-sm font-bold text-center transition-opacity flex items-center justify-center gap-1 ${isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden mt-0"}`}
                        style={{ color: color.accent, background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/roadmaps/' + rm.roadmapId);
                        }}
                      >
                        Continue Learning
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : !isLoading ? (
              <div className="roadmaps-empty">
                <span className="roadmaps-empty-icon">📭</span>
                <p>You haven't started any roadmaps yet.</p>
                <Link to="/career-paths" className="roadmaps-empty-cta">
                  Explore Career Paths →
                </Link>
              </div>
            ) : null}
          </section>




        </div>

        {/* ── Footer ── */}
        <footer className="dashboard-footer">
          <div className="footer-links">
            <Link to="#">PRIVACY POLICY</Link>
            <Link to="#">TERMS OF SERVICE</Link>
            <Link to="#">SUPPORT</Link>
          </div>
          <p className="footer-copyright">© 2024 DevPath. The Architectural Navigator.</p>
        </footer>
      </main>

      <MilestonesModal 
        isOpen={isMilestonesModalOpen} 
        onClose={() => setIsMilestonesModalOpen(false)} 
        milestones={unlockedMilestones}
      />
    </div>
  );
};