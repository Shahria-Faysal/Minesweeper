import { useNavigate } from "react-router-dom";

const SAVE_STATUS_TEXT = {
  saving: "Saving result...",
  saved: "Result saved ✓",
  error: "Couldn't save result — check your connection.",
};

function ResultModal({
  gameStatus,
  score,
  timeElapsed,
  hintsUsed,
  saveStatus,
  isNewBest,
  onRestart,
}) {
  const navigate = useNavigate();

  const isOver = gameStatus === "won" || gameStatus === "lost";
  if (!isOver) return null;

  const isWin = gameStatus === "won";
  const saveStatusText = SAVE_STATUS_TEXT[saveStatus];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isWin ? "🎉 YOU WON!" : "💣 GAME OVER"}</h2>

        {isWin && isNewBest && <p className="modal-new-best">🏆 New Personal Best!</p>}

        <p className="modal-stat">Score: {score}</p>
        <p className="modal-stat">Time: {timeElapsed} seconds</p>
        {isWin && <p className="modal-stat">Hints Used: {hintsUsed}</p>}

        {saveStatusText && (
          <p className={`modal-save-status modal-save-${saveStatus}`}>{saveStatusText}</p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            {isWin ? "Play Again" : "Try Again"}
          </button>
          {isWin && (
            <button type="button" className="btn" onClick={() => navigate("/dashboard")}>
              View Statistics
            </button>
          )}
          <button type="button" className="btn" onClick={() => navigate("/leaderboard")}>
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
