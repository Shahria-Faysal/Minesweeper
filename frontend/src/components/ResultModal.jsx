import { useNavigate } from "react-router-dom";

const SAVE_STATUS_TEXT = {
  saving: "Saving result...",
  saved: "Result saved ✓",
  error: "Couldn't save result — check your connection.",
};

// There's no win condition, so there's only one result screen: it
// shows whenever a mine ends the game, and score reflects how far
// the player got, not a win/lose outcome.
function ResultModal({
  gameStatus,
  score,
  timeElapsed,
  cellsRevealed,
  hintsUsed,
  saveStatus,
  isNewBest,
  onRestart,
}) {
  const navigate = useNavigate();

  if (gameStatus !== "lost") return null;

  const saveStatusText = SAVE_STATUS_TEXT[saveStatus];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>💣 GAME OVER</h2>

        {isNewBest && <p className="modal-new-best">🏆 New Personal Best!</p>}

        <p className="modal-stat">Score: {score}</p>
        <p className="modal-stat">Time Survived: {timeElapsed} seconds</p>
        <p className="modal-stat">Cells Revealed: {cellsRevealed}</p>
        <p className="modal-stat">Hints Used: {hintsUsed}</p>

        {saveStatusText && (
          <p className={`modal-save-status modal-save-${saveStatus}`}>{saveStatusText}</p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            Try Again
          </button>
          <button type="button" className="btn" onClick={() => navigate("/dashboard")}>
            View Statistics
          </button>
          <button type="button" className="btn" onClick={() => navigate("/leaderboard")}>
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
