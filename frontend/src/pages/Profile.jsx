import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchStats } from "../services/gameService";
import "../styles/tables.css";
import "../styles/profile.css";

const DIFFICULTIES = [
  { key: "all", label: "All Modes" },
  { key: "beginner", label: "Beginner" },
  { key: "advanced", label: "Advanced" },
];

function StatCard({ label, value, icon, highlight }) {
  return (
    <div className={`profile-stat-card${highlight ? " profile-stat-card--highlight" : ""}`}>
      <span className="profile-stat-icon">{icon}</span>
      <span className="profile-stat-value">{value}</span>
      <span className="profile-stat-label">{label}</span>
    </div>
  );
}

function DifficultyBadge({ label }) {
  return <span className="profile-difficulty-badge">{label}</span>;
}

function Profile() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading");
  const [joined] = useState(() => {
    // If user object has a createdAt field use it, otherwise fallback
    if (user.createdAt) return new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    return "Unknown";
  });

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchStats(activeFilter)
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => { cancelled = true; };
  }, [activeFilter]);

  const winRate =
    stats && stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : null;

  return (
    <div className="page profile-page">

      {/* ── Hero Banner ── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" aria-hidden="true">
          <div className="profile-hero-grid" />
          <div className="profile-hero-glow" />
        </div>

        <div className="profile-avatar-ring">
          <div className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-avatar-pulse" aria-hidden="true" />
        </div>

        <div className="profile-hero-info">
          <h2 className="profile-username">{user.username.toUpperCase()}</h2>
          <p className="profile-hero-sub">OPERATOR · CLEARANCE LEVEL 1</p>
          <div className="profile-hero-meta">
            {user.email && (
              <span className="profile-meta-chip" id="profile-email">
                <span className="profile-meta-icon">✉</span>
                {user.email}
              </span>
            )}
            <span className="profile-meta-chip" id="profile-joined">
              <span className="profile-meta-icon">📅</span>
              Joined {joined}
            </span>
            <span className="profile-meta-chip profile-meta-chip--online">
              <span className="profile-status-dot" />
              Online
            </span>
          </div>
        </div>

        <Link to="/game" className="btn btn-primary profile-hero-cta" id="profile-play-btn">
          ▶ Play Now
        </Link>
      </div>

      {/* ── Difficulty Filter ── */}
      <div className="profile-section">
        <div className="profile-section-header">
          <h3 className="profile-section-title">COMBAT STATISTICS</h3>
          <div className="profile-filter-tabs" id="profile-filter-tabs">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                type="button"
                className={`profile-filter-tab${activeFilter === d.key ? " active" : ""}`}
                onClick={() => setActiveFilter(d.key)}
                id={`profile-filter-${d.key}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {status === "loading" && (
          <div className="profile-loading">
            <div className="profile-loading-dots">
              <span /><span /><span />
            </div>
            <p>Loading stats…</p>
          </div>
        )}

        {status === "error" && (
          <p className="error-state">⚠ Failed to load stats. Try refreshing.</p>
        )}

        {status === "ready" && stats && stats.gamesPlayed === 0 && (
          <div className="profile-empty">
            <p className="profile-empty-icon">💣</p>
            <p className="profile-empty-text">No games recorded for this mode yet.</p>
            <Link to="/game" className="btn btn-primary" id="profile-empty-play-btn">Start Playing</Link>
          </div>
        )}

        {status === "ready" && stats && stats.gamesPlayed > 0 && (
          <div className="profile-stats-grid" id="profile-stats-grid">
            <StatCard
              icon="🎮"
              label="Games Played"
              value={stats.gamesPlayed}
              highlight
            />
            <StatCard
              icon="🏆"
              label="High Score"
              value={stats.highestScore ?? "—"}
              highlight
            />
            <StatCard
              icon="📊"
              label="Avg Score"
              value={stats.averageScore ?? "—"}
            />
            <StatCard
              icon="⏱"
              label="Longest Survival"
              value={stats.longestSurvival !== null ? `${stats.longestSurvival}s` : "—"}
            />
            <StatCard
              icon="🔲"
              label="Most Cells Revealed"
              value={stats.mostCellsRevealed ?? "—"}
            />
            {winRate !== null && (
              <StatCard
                icon="🎯"
                label="Win Rate"
                value={`${winRate}%`}
                highlight={winRate >= 50}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div className="profile-section profile-links-section">
        <h3 className="profile-section-title">QUICK ACCESS</h3>
        <div className="profile-quick-links">
          <Link to="/dashboard" className="profile-quick-link" id="profile-link-dashboard">
            <span className="profile-quick-link-icon">📋</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/history" className="profile-quick-link" id="profile-link-history">
            <span className="profile-quick-link-icon">📜</span>
            <span>Game History</span>
          </Link>
          <Link to="/leaderboard" className="profile-quick-link" id="profile-link-leaderboard">
            <span className="profile-quick-link-icon">🏅</span>
            <span>Leaderboard</span>
          </Link>
          <Link to="/game" className="profile-quick-link profile-quick-link--accent" id="profile-link-game">
            <span className="profile-quick-link-icon">💣</span>
            <span>Play Game</span>
          </Link>
        </div>
      </div>

    </div>
  );
}

export default Profile;
