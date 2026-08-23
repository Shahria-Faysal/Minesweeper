import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCountUp } from "../hooks/useCountUp";
import { fetchStats } from "../services/gameService";
import "../styles/tables.css";
import "../styles/profile.css";

const DIFFICULTIES = [
  { key: "all",      label: "All Modes" },
  { key: "beginner", label: "Beginner"  },
  { key: "advanced", label: "Advanced"  },
];

/** Animated stat card — counts up from 0 when data arrives */
function StatCard({ label, value, icon, highlight }) {
  const animated = useCountUp(value);

  return (
    <div className={`profile-stat-card${highlight ? " profile-stat-card--highlight" : ""}`}>
      <span className="profile-stat-icon" aria-hidden="true">{icon}</span>
      <span className="profile-stat-value">{animated}</span>
      <span className="profile-stat-label">{label}</span>
    </div>
  );
}

/** Skeleton placeholder shown while stats are loading */
function SkeletonCard() {
  return (
    <div className="profile-stat-card profile-stat-card--skeleton" aria-hidden="true">
      <span className="skeleton" style={{ width: "20px", height: "20px", display: "block" }} />
      <span className="skeleton" style={{ width: "60%", height: "28px", display: "block", marginTop: "0.35rem" }} />
      <span className="skeleton" style={{ width: "80%", height: "12px", display: "block", marginTop: "0.35rem" }} />
    </div>
  );
}

function Profile() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading");

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : null;

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
    stats && stats.gamesPlayed > 0 && stats.gamesWon != null
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : null;

  // Index of the active tab for the sliding indicator
  const activeTabIndex = DIFFICULTIES.findIndex((d) => d.key === activeFilter);

  return (
    <div className="page profile-page">

      {/* ── Hero Banner ── */}
      <div className="profile-hero">

        <div className="profile-avatar-ring">
          <div className="profile-avatar" aria-label={`Avatar for ${user.username}`}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-hero-info">
          <h2 className="profile-username">{user.username.toUpperCase()}</h2>
          <p className="profile-hero-sub">OPERATOR · CLEARANCE LEVEL 1</p>

          <div className="profile-hero-meta">
            {user.email && (
              <span className="profile-meta-chip" id="profile-email">
                <span aria-hidden="true">✉</span>{user.email}
              </span>
            )}
            {joined && (
              <span className="profile-meta-chip" id="profile-joined">
                <span aria-hidden="true">📅</span>Joined {joined}
              </span>
            )}
            <span className="profile-meta-chip profile-meta-chip--online">
              <span className="profile-status-dot" aria-hidden="true" />
              Online
            </span>
          </div>
        </div>

        <Link to="/game" className="btn btn-primary profile-hero-cta" id="profile-play-btn">
          ▶ Play Now
        </Link>
      </div>

      {/* ── Combat Statistics ── */}
      <div className="profile-section">
        <div className="profile-section-header">
          <h3 className="profile-section-title">COMBAT STATISTICS</h3>

          {/* Sliding-indicator tab bar */}
          <div
            className="profile-filter-tabs"
            id="profile-filter-tabs"
            role="tablist"
            aria-label="Filter by difficulty"
          >
            <div
              className="profile-filter-indicator"
              style={{ "--tab-index": activeTabIndex, "--tab-count": DIFFICULTIES.length }}
              aria-hidden="true"
            />
            {DIFFICULTIES.map((d, i) => (
              <button
                key={d.key}
                type="button"
                role="tab"
                aria-selected={activeFilter === d.key}
                className={`profile-filter-tab${activeFilter === d.key ? " active" : ""}`}
                onClick={() => setActiveFilter(d.key)}
                id={`profile-filter-${d.key}`}
                style={{ "--i": i }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading — skeletons */}
        {status === "loading" && (
          <div className="profile-stats-grid" aria-label="Loading statistics">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {status === "error" && (
          <p className="error-state">⚠ Failed to load stats. Try refreshing.</p>
        )}

        {status === "ready" && stats && stats.gamesPlayed === 0 && (
          <div className="profile-empty">
            <p className="profile-empty-icon" aria-hidden="true">💣</p>
            <p className="profile-empty-text">No games recorded for this mode yet.</p>
            <Link to="/game" className="btn btn-primary" id="profile-empty-play-btn">Start Playing</Link>
          </div>
        )}

        {status === "ready" && stats && stats.gamesPlayed > 0 && (
          <div className="profile-stats-grid" id="profile-stats-grid">
            <StatCard icon="🎮" label="Games Played"       value={stats.gamesPlayed}    highlight />
            <StatCard icon="🏆" label="High Score"         value={stats.highestScore ?? "—"} highlight />
            <StatCard icon="📊" label="Avg Score"          value={stats.averageScore ?? "—"} />
            <StatCard icon="⏱"  label="Longest Survival"  value={stats.longestSurvival !== null ? `${stats.longestSurvival}s` : "—"} />
            <StatCard icon="🔲" label="Most Cells Revealed" value={stats.mostCellsRevealed ?? "—"} />
            {winRate !== null && (
              <StatCard icon="🎯" label="Win Rate" value={`${winRate}%`} highlight={winRate >= 50} />
            )}
          </div>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div className="profile-section profile-links-section">
        <h3 className="profile-section-title">QUICK ACCESS</h3>
        <div className="profile-quick-links">
          <Link to="/dashboard"   className="profile-quick-link" id="profile-link-dashboard">
            <span className="profile-quick-link-icon" aria-hidden="true">📋</span>Dashboard
          </Link>
          <Link to="/history"     className="profile-quick-link" id="profile-link-history">
            <span className="profile-quick-link-icon" aria-hidden="true">📜</span>Game History
          </Link>
          <Link to="/leaderboard" className="profile-quick-link" id="profile-link-leaderboard">
            <span className="profile-quick-link-icon" aria-hidden="true">🏅</span>Leaderboard
          </Link>
          <Link to="/game" className="profile-quick-link profile-quick-link--accent" id="profile-link-game">
            <span className="profile-quick-link-icon" aria-hidden="true">💣</span>Play Game
          </Link>
        </div>
      </div>

    </div>
  );
}

export default Profile;
