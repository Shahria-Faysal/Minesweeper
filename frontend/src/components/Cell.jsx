function Cell({ cell, gameStatus, isHinted, onReveal, onFlag }) {
  const { row, col, isRevealed, isFlagged, isMine, adjacentMines } = cell;

  function handleClick() {
    onReveal(row, col);
  }

  function handleContextMenu(event) {
    event.preventDefault(); // stop the browser's right-click menu
    onFlag(row, col);
  }

  const isGameOver = gameStatus === "won" || gameStatus === "lost";
  const showAsMine = isRevealed && isMine;
  const isWrongFlag = isGameOver && isFlagged && !isMine;
  // Only show the hint glow on a cell that's still actually hidden —
  // once revealed or flagged, the highlight has nothing left to say.
  const showHint = isHinted && !isRevealed && !isFlagged;

  let content = "";
  if (isFlagged) {
    content = isWrongFlag ? "❌" : "🚩";
  } else if (isRevealed) {
    if (isMine) {
      content = "💣";
    } else if (adjacentMines > 0) {
      content = adjacentMines;
    }
  }

  const classNames = [
    "cell",
    isRevealed ? "cell-revealed" : "cell-hidden",
    showAsMine ? "cell-mine" : "",
    isRevealed && !isMine && adjacentMines > 0 ? `cell-number-${adjacentMines}` : "",
    showHint ? "cell-hint" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      disabled={isRevealed}
      aria-label={`Cell row ${row + 1}, column ${col + 1}`}
    >
      {content}
    </button>
  );
}

export default Cell;
