function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function GameHeader({
  difficultyLabel,
  minesRemaining,
  timeElapsed,
  score,
  hintsUsed,
  maxHints,
  onHint,
  onRestart,
  hintDisabled,
}) {
  return (
    <div className="game-header">
      <p className="difficulty-label">Difficulty: {difficultyLabel}</p>

      <div className="game-stats">
        <span>💣 Mines: {minesRemaining}</span>
        <span>⏱ {formatTime(timeElapsed)}</span>
        <span>🏆 Score: {score}</span>
        <span>
          💡 Hints: {hintsUsed}/{maxHints}
        </span>
      </div>

      <div className="game-actions">
        <button type="button" onClick={onHint} disabled={hintDisabled}>
          💡 Hint
        </button>
        <button type="button" onClick={onRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default GameHeader;
