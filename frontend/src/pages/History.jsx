import { useState, useEffect } from "react";
import { fetchHistory } from "../services/gameService";
import "../styles/tables.css";

function formatDate(playedAt) {
  // MySQL TIMESTAMP comes back as "YYYY-MM-DD HH:MM:SS"; make it a
  // format the Date constructor parses reliably.
  const date = new Date(playedAt.replace(" ", "T"));
  return date.toLocaleString();
}

function History() {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    fetchHistory()
      .then((data) => {
        if (cancelled) return;
        setHistory(data.history);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <div className="header-flex">
        <div>
          <h2>OPERATOR LOGS</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
            COMPLETED GAME RECORD
          </p>
        </div>
      </div>

      {status === "loading" && <p className="loading-state">Loading your games...</p>}
      {status === "error" && <p className="error-state">Couldn't load your game history.</p>}

      {status === "ready" && history.length === 0 && (
        <p className="empty-state">You haven't finished a game yet — go play one!</p>
      )}

      {status === "ready" && history.length > 0 && (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Difficulty</th>
                <th>Score</th>
                <th>Time</th>
                <th>Cells Revealed</th>
                <th>Hints Used</th>
              </tr>
            </thead>
            <tbody>
              {history.map((game) => (
                <tr key={game.id}>
                  <td>{formatDate(game.playedAt)}</td>
                  <td>{game.difficulty}</td>
                  <td>{game.score}</td>
                  <td>{game.timeTaken}s</td>
                  <td>{game.cellsRevealed}</td>
                  <td>{game.hintsUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;
