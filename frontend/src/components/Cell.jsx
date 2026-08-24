function Cell({ cell, gameStatus, isHinted, onReveal, onFlag, onChord }) {
  const { row, col, isRevealed, isFlagged, isMine, adjacentMines } = cell;

  function handleClick() {
    if (isRevealed) {
      // Chord: clicking a numbered revealed cell attempts chording.
      // Empty cells (adjacentMines === 0) and mine cells do nothing.
      if (!isMine && adjacentMines > 0) {
        onChord(row, col);
      }
    } else if (!isFlagged) {
      // Normal reveal: only hidden, unflagged cells
      onReveal(row, col);
    }
    // Flagged hidden cells: do nothing on left-click
  }

  function handleContextMenu(event) {
    event.preventDefault(); // always stop the browser's right-click menu on board cells
    if (!isRevealed) {
      onFlag(row, col);
    }
    // Right-clicking a revealed cell does nothing
  }

  const isGameOver = gameStatus === "lost";
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
      aria-label={`Cell row ${row + 1}, column ${col + 1}`}
    >
      {content}
    </button>
  );
}

export default Cell;
