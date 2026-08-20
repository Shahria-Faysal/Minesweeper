function ResultModal({ gameStatus, score, timeElapsed, onRestart }) {
  const isOver = gameStatus === "won" || gameStatus === "lost";
  if (!isOver) return null;

  const isWin = gameStatus === "won";

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isWin ? "You Win! 🎉" : "Game Over 💥"}</h2>
        <p>Time: {timeElapsed}s</p>
        <p>Score: {score}</p>
        <button type="button" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
}

export default ResultModal;
