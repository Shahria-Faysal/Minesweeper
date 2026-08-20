function ResultModal({ gameStatus, score, timeElapsed, hintsUsed, onRestart }) {
  const isOver = gameStatus === "won" || gameStatus === "lost";
  if (!isOver) return null;

  const isWin = gameStatus === "won";

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isWin ? "🎉 You Won!" : "💣 Game Over"}</h2>

        <p className="modal-stat">Score: {score}</p>
        <p className="modal-stat">Time: {timeElapsed} seconds</p>
        {isWin && <p className="modal-stat">Hints Used: {hintsUsed}</p>}

        <button type="button" onClick={onRestart}>
          {isWin ? "Play Again" : "Try Again"}
        </button>
      </div>
    </div>
  );
}

export default ResultModal;
