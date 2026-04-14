/**
 * FrontendRoadmapPage
 * Centered tree layout imitating roadmap.sh frontend-beginner chart,
 * with chronological learning and localStorage progress sync.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FrontendRoadmapPage.css";

/* ── Import tất cả file markdown trong thư mục content ── */
const contentModules = import.meta.glob("../content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function getContent(nodeId: string): string {
  for (const [path, content] of Object.entries(contentModules)) {
    if (path.includes(`@${nodeId}`)) return content as string;
  }
  return "";
}

interface ParsedContent {
  title: string;
  description: string;
  resources: { type: string; label: string; url: string }[];
}

function parseMarkdown(raw: string): ParsedContent {
  const lines = raw.split("\n").map((l) => l.trim());
  const title = lines.find((l) => l.startsWith("# "))?.replace("# ", "") ?? "";
  const descLines: string[] = [];
  const resources: ParsedContent["resources"] = [];

  let inResources = false;
  for (const line of lines) {
    if (line.startsWith("# ")) continue;
    if (line.startsWith("Visit the following")) { inResources = true; continue; }
    if (inResources && line.startsWith("- [")) {
      const match = line.match(/\[@(\w+)@([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        resources.push({ type: match[1], label: match[2], url: match[3] });
      }
    } else if (!inResources && line && !line.startsWith("-")) {
      descLines.push(line);
    }
  }
  return { title, description: descLines.join(" "), resources };
}

/* ── Node data ── */
type Status = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

interface FrontendNode {
  id: string;
  label: string;
  icon: string;
  category: string;
  order: number;
}

const ALL_NODES: FrontendNode[] = [
  { id: "yWG2VUkaF5IJVVut6AiSy", label: "HTML", icon: "🌐", category: "Core", order: 1 },
  { id: "ZhJhf1M2OphYbEmduFq-9", label: "CSS", icon: "🎨", category: "Core", order: 2 },
  { id: "ODcfFEorkfJNupoQygM53", label: "JavaScript", icon: "⚡", category: "Core", order: 3 },
  { id: "R_I4SGYqLk5zze5I1zS_E", label: "Git", icon: "🔀", category: "Version Control", order: 4 },
  { id: "qmTVMJDsEhNIkiwE_UTYu", label: "GitHub", icon: "🐙", category: "Version Control", order: 5 },
  { id: "ib_FHinhrw8VuSet-xMF7", label: "npm", icon: "📦", category: "Package Manager", order: 6 },
  { id: "tG5v3O4lNIFc2uCnacPak", label: "React", icon: "⚛️", category: "Framework", order: 7 },
  { id: "eghnfG4p7i-EDWfp3CQXC", label: "Tailwind", icon: "💨", category: "Styling", order: 8 },
  { id: "hVQ89f6G0LXEgHIOKHDYq", label: "Vitest", icon: "🧪", category: "Testing", order: 9 },
];

function getNode(id: string) {
  return ALL_NODES.find(n => n.label === id) as FrontendNode;
}

function ResourceTypeIcon({ type }: { type: string }) {
  if (type === "video")
    return (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    );
  if (type === "official" || type === "roadmap")
    return (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

/* ── Logic ── */
function checkIsLocked(nodeOrder: number, statuses: Record<string, Status>): boolean {
  if (nodeOrder === 1) return false;

  // Git(4) & GitHub(5) depend on JS(3)
  if (nodeOrder === 4 || nodeOrder === 5) {
    const jsNode = ALL_NODES.find(n => n.order === 3)!;
    return statuses[jsNode.id] !== "COMPLETED";
  }

  // npm(6) depends on BOTH Git(4) AND GitHub(5)
  if (nodeOrder === 6) {
    const gitNode = ALL_NODES.find(n => n.order === 4)!;
    const githubNode = ALL_NODES.find(n => n.order === 5)!;
    return statuses[gitNode.id] !== "COMPLETED" || statuses[githubNode.id] !== "COMPLETED";
  }

  // Normal chronological dependence on order - 1
  const prevNode = ALL_NODES.find(n => n.order === nodeOrder - 1);
  if (!prevNode) return false;
  return statuses[prevNode.id] !== "COMPLETED";
}

/* ── Drawer ── */
interface DrawerProps {
  node: FrontendNode | null;
  status: Status;
  isLocked: boolean;
  onClose: () => void;
  onStatusChange: (id: string, s: Status) => void;
}

function NodeDrawer({ node, status, isLocked, onClose, onStatusChange }: DrawerProps) {
  if (!node) return null;
  const raw = getContent(node.id);
  const { description, resources } = parseMarkdown(raw);

  const statusLabel: Record<Status, string> = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };
  const statusClass: Record<Status, string> = {
    NOT_STARTED: "frm-badge--orange",
    IN_PROGRESS: "frm-badge--purple",
    COMPLETED: "frm-badge--cyan",
  };

  return (
    <div className="frm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="frm-drawer">
        <div className="frm-drawer-header">
          <div className="frm-drawer-header-info">
            <span className="frm-drawer-category">{node.category}</span>
            <h2 className="frm-drawer-title">
              <span className="frm-drawer-icon">{node.icon}</span>
              {node.label}
            </h2>
            {isLocked ? (
              <span className="frm-badge frm-badge--orange">Locked</span>
            ) : (
              <span className={`frm-badge ${statusClass[status]}`}>{statusLabel[status]}</span>
            )}
          </div>
          <button className="frm-drawer-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="frm-drawer-body">
          {isLocked && (
            <div style={{ background: "rgba(255,184,115,0.1)", border: "1px solid rgba(255,184,115,0.4)", padding: "16px", borderRadius: "8px", color: "#ffb873", display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "20px" }}>🔒</span>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
                This step is currently locked. You must complete the previous prerequisites before starting this topic.
              </p>
            </div>
          )}

          {description && (
            <section className="frm-drawer-section">
              <h3 className="frm-drawer-section-title">Overview</h3>
              <p className="frm-drawer-section-desc">{description}</p>
            </section>
          )}

          {resources.length > 0 && (
            <section className="frm-drawer-section">
              <h3 className="frm-drawer-section-title">Learning Resources</h3>
              <ul className="frm-resource-list">
                {resources.map((r, i) => {
                  const isInternal = r.url.startsWith("/");
                  const LinkComponent = isInternal ? Link : "a";
                  const linkProps = isInternal ? { to: r.url } as any : { href: r.url, target: "_blank", rel: "noreferrer" };

                  return (
                    <li key={i}>
                      <LinkComponent {...linkProps} className="frm-resource-card">
                        <span className="frm-resource-icon">
                          <ResourceTypeIcon type={r.type} />
                        </span>
                        <span className="frm-resource-info">
                          <span className="frm-resource-label">{r.label}</span>
                          <span className="frm-resource-type">{r.type}</span>
                        </span>
                        {isInternal ? (
                          <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="frm-resource-arrow">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="frm-resource-arrow">
                            <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                          </svg>
                        )}
                      </LinkComponent>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {node.label === "JavaScript" && !isLocked && (
            <div style={{ marginTop: "24px", marginBottom: "8px" }}>
              <Link to="/javascript-roadmap" className="frm-resource-card" style={{ background: "rgba(76, 215, 246, 0.1)", borderColor: "#4cd7f6", textDecoration: "none" }}>
                <span className="frm-resource-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>⚡</span>
                  <span className="frm-resource-label" style={{ color: "#4cd7f6", fontWeight: "bold", fontSize: "15px" }}>Visit JavaScript roadmap</span>
                </span>
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="#4cd7f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ justifySelf: "flex-end" }}>
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        <div className="frm-drawer-footer">
          <p className="frm-drawer-footer-label">Change Status:</p>
          <div className="frm-status-btns">
            {(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as Status[]).map((s) => (
              <button
                key={s}
                disabled={isLocked}
                onClick={() => onStatusChange(node.id, s)}
                style={{ opacity: isLocked ? 0.3 : 1, cursor: isLocked ? "not-allowed" : "pointer" }}
                className={`frm-status-btn frm-status-btn--${s.toLowerCase().replace("_", "-")} ${status === s && !isLocked ? "active" : ""}`}
              >
                {statusLabel[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function FrontendRoadmapPage() {
  const [statuses, setStatuses] = useState<Record<string, Status>>(() => {
    try {
      const saved = localStorage.getItem("frontendRoadmapProgress");
      if (saved) return JSON.parse(saved);
    } catch { }
    return Object.fromEntries(ALL_NODES.map((n) => [n.id, "NOT_STARTED"]));
  });

  const [selected, setSelected] = useState<FrontendNode | null>(null);

  useEffect(() => {
    localStorage.setItem("frontendRoadmapProgress", JSON.stringify(statuses));
  }, [statuses]);

  const handleStatusChange = (id: string, s: Status) => {
    setStatuses((prev) => ({ ...prev, [id]: s }));
  };

  // Prevent users from clicking "Completed" dynamically if locked
  const completedCount = Object.values(statuses).filter((s) => s === "COMPLETED").length;

  const renderCard = (node: FrontendNode) => {
    const isLocked = checkIsLocked(node.order, statuses);
    const status = statuses[node.id];

    let statusCardClass = "frm-node-card--not-started";
    let pillClass = "frm-pill--not-started";
    let statusString = "Not Started";

    if (isLocked) {
      statusCardClass = "frm-node-card--locked";
      pillClass = "frm-pill--locked";
      statusString = "Locked";
    } else if (status === "COMPLETED") {
      statusCardClass = "frm-node-card--completed";
      pillClass = "frm-pill--completed";
      statusString = "✓ Completed";
    } else if (status === "IN_PROGRESS") {
      statusCardClass = "frm-node-card--in-progress";
      pillClass = "frm-pill--in-progress";
      statusString = "In Progress";
    }

    return (
      <button
        key={node.id}
        className={`frm-node-card ${statusCardClass}`}
        onClick={() => {
          setSelected(node);
        }}
      >
        <div className="frm-node-card-top">
          <span className="frm-node-step">Step {node.order}</span>
          <span className="frm-node-category">{node.category}</span>
        </div>
        <div className="frm-node-name-row">
          <span className="frm-node-icon">{node.icon}</span>
          <h3 className="frm-node-name">{node.label}</h3>
        </div>
        <div className={`frm-node-status-pill ${pillClass}`}>
          {statusString}
        </div>
      </button>
    );
  };

  return (
    <div className="frm-page">
      <div className="frm-page-header">
        <div className="frm-page-header-inner">
          <span className="frm-page-eyebrow">Learning Path</span>
          <h1 className="frm-page-title">Frontend Developer Roadmap</h1>
          <p className="frm-page-subtitle">
            Beginner-friendly path — from zero to Junior Frontend Developer.
          </p>
          <div className="frm-progress-bar-wrap">
            <div className="frm-progress-bar-labels">
              <span>{completedCount} / {ALL_NODES.length} topics completed</span>
              <span>{Math.round((completedCount / ALL_NODES.length) * 100)}%</span>
            </div>
            <div className="frm-progress-bar-track">
              <div
                className="frm-progress-bar-fill"
                style={{ width: `${(completedCount / ALL_NODES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="frm-roadmap-wrap">
        <div className="frm-tree-container">

          {/* Top segment */}
          {renderCard(getNode("HTML"))}
          <div className="frm-v-line" />

          {renderCard(getNode("CSS"))}
          <div className="frm-v-line" />

          {renderCard(getNode("JavaScript"))}

          {/* Fork for Git & GitHub */}
          <div className="frm-tree-fork-wrap">
            <svg className="frm-fork-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 50 0 C 50 20, 10 30, 10 50 C 10 70, 50 80, 50 100" />
              <path d="M 50 0 C 50 20, 90 30, 90 50 C 90 70, 50 80, 50 100" />
            </svg>
            <div className="frm-fork-node">{renderCard(getNode("Git"))}</div>
            <div className="frm-fork-node">{renderCard(getNode("GitHub"))}</div>
          </div>

          {/* Bottom segment */}
          {renderCard(getNode("npm"))}
          <div className="frm-v-line" />

          {renderCard(getNode("React"))}
          <div className="frm-v-line" />

          {renderCard(getNode("Tailwind"))}
          <div className="frm-v-line" />

          {renderCard(getNode("Vitest"))}

        </div>
      </div>

      {selected && (
        <NodeDrawer
          node={selected}
          status={statuses[selected.id]}
          isLocked={checkIsLocked(selected.order, statuses)}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

export { FrontendRoadmapPage };
