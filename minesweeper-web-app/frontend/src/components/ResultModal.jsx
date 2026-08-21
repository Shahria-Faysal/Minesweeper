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
  const isOver = gameStatus === "won" || gameStatus === "lost";
  if (!isOver) return null;

  const isWin = gameStatus === "won";
  const saveStatusText = SAVE_STATUS_TEXT[saveStatus];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isWin ? "🎉 You Won!" : "💣 Game Over"}</h2>

        {isWin && isNewBest && <p className="modal-new-best">🎉 NEW PERSONAL BEST!</p>}

        <p className="modal-stat">Score: {score}</p>
        <p className="modal-stat">Time: {timeElapsed} seconds</p>
        {isWin && <p className="modal-stat">Hints Used: {hintsUsed}</p>}

        {saveStatusText && (
          <p className={`modal-save-status modal-save-${saveStatus}`}>{saveStatusText}</p>
        )}

        <button type="button" onClick={onRestart}>
          {isWin ? "Play Again" : "Try Again"}
        </button>
      </div>
    </div>
  );
}

export default ResultModal;
