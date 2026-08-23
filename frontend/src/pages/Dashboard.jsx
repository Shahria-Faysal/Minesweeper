import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchStats } from "../services/gameService";
import FilterBar from "../components/FilterBar";
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
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user.username}</h1>
          <p className="dashboard-subtitle">Here's how your Minesweeper games are going.</p>
        </div>
        <Link to="/game" className="btn btn-primary">
          Play Minesweeper
        </Link>
      </div>

      <FilterBar options={FILTERS} active={filter} onChange={handleFilterChange} />

      {status === "loading" && <p className="loading-state">Loading your stats...</p>}
      {status === "error" && <p className="error-state">Couldn't load your stats.</p>}

      {status === "ready" && stats && stats.gamesPlayed === 0 && (
        <p className="empty-state">No games played yet for this difficulty — go play one!</p>
      )}

      {status === "ready" && stats && stats.gamesPlayed > 0 && (
        <div className="stats-grid">
          <StatCard label="Games Played" value={stats.gamesPlayed} />
          <StatCard label="Highest Score" value={stats.highestScore ?? "—"} />
          <StatCard label="Average Score" value={stats.averageScore} />
          <StatCard
            label="Longest Survival"
            value={stats.longestSurvival !== null ? `${stats.longestSurvival}s` : "—"}
          />
          <StatCard label="Most Cells Revealed" value={stats.mostCellsRevealed ?? "—"} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
