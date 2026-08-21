import { useState, useEffect } from "react";
import { fetchLeaderboard } from "../services/gameService";
import FilterBar from "../components/FilterBar";
import "../styles/tables.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "beginner", label: "Beginner" },
  { key: "advanced", label: "Advanced" },
];

function Leaderboard() {
  const [filter, setFilter] = useState("all");
  const [leaderboard, setLeaderboard] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    fetchLeaderboard(filter)
      .then((data) => {
        if (cancelled) return;
        setLeaderboard(data.leaderboard);
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
      <h1>Leaderboard</h1>

      <FilterBar options={FILTERS} active={filter} onChange={handleFilterChange} />

      {status === "loading" && <p className="loading-state">Loading leaderboard...</p>}
      {status === "error" && <p className="error-state">Couldn't load the leaderboard.</p>}

      {status === "ready" && leaderboard.length === 0 && (
        <p className="empty-state">No completed games yet for this difficulty.</p>
      )}

      {status === "ready" && leaderboard.length > 0 && (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Difficulty</th>
                <th>Score</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={`${entry.rank}-${entry.username}`}>
                  <td>#{entry.rank}</td>
                  <td>{entry.username}</td>
                  <td>{entry.difficulty}</td>
                  <td>{entry.score}</td>
                  <td>{entry.timeTaken}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
