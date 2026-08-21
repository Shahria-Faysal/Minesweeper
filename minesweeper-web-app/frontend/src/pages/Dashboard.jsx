import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchStats } from "../services/gameService";
import "../styles/tables.css";

const FILTERS = [
  { key: "all", label: "Overall" },
  { key: "beginner", label: "Beginner" },
  { key: "advanced", label: "Advanced" },
];

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    fetchStats(filter)
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  function handleFilterChange(key) {
    setStatus("loading");
    setFilter(key);
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Welcome, {user.username}.</p>

      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={filter === f.key ? "filter-active" : ""}
            onClick={() => handleFilterChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {status === "loading" && <p className="loading-state">Loading your stats...</p>}
      {status === "error" && <p className="error-state">Couldn't load your stats.</p>}

      {status === "ready" && stats && stats.gamesPlayed === 0 && (
        <p className="empty-state">No games played yet for this difficulty.</p>
      )}

      {status === "ready" && stats && stats.gamesPlayed > 0 && (
        <div className="stats-grid">
          <StatCard label="Games Played" value={stats.gamesPlayed} />
          <StatCard label="Games Won" value={stats.gamesWon} />
          <StatCard label="Games Lost" value={stats.gamesLost} />
          <StatCard label="Win Rate" value={`${stats.winRate}%`} />
          <StatCard label="Highest Score" value={stats.highestScore ?? "—"} />
          <StatCard
            label="Best Time"
            value={stats.bestTime !== null ? `${stats.bestTime}s` : "—"}
          />
          <StatCard label="Average Score" value={stats.averageScore} />
          <StatCard label="Current Win Streak" value={stats.currentStreak} />
          <StatCard label="Best Win Streak" value={stats.bestStreak} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
