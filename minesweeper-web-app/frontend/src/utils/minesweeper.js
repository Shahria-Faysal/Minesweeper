// Pure Minesweeper game logic — no React here on purpose.
// Every function takes a board in, and returns a new board out,
// which makes each step easy to reason about (and to explain) on
// its own.

export const DIFFICULTIES = {
  beginner: { label: "Beginner", rows: 9, cols: 9, mines: 10 },
  advanced: { label: "Advanced", rows: 16, cols: 16, mines: 40 },
};

export const MAX_HINTS = 3;
export const HINT_COST = 50;
export const HINT_HIGHLIGHT_MS = 3000;

/**
 * Builds a rows x cols grid of empty cells. No mines yet — mines are
 * placed later, on the first click (see placeMines below).
 */
export function createEmptyBoard(rows, cols) {
  const board = [];
  for (let row = 0; row < rows; row++) {
    const rowCells = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push({
        row,
        col,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      });
    }
    board.push(rowCells);
  }
  return board;
}

// Returns the (up to 8) cells surrounding (row, col) — the classic
// Minesweeper neighborhood, skipping the cell itself and anything
// off the edge of the grid.
function getNeighbors(board, row, col) {
  const neighbors = [];
  for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
    for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
      if (deltaRow === 0 && deltaCol === 0) continue;

      const r = row + deltaRow;
      const c = col + deltaCol;
      const inBounds = r >= 0 && r < board.length && c >= 0 && c < board[0].length;

      if (inBounds) {
        neighbors.push(board[r][c]);
      }
    }
  }
  return neighbors;
}

/**
 * Places `mineCount` mines randomly, then computes each cell's
 * adjacent-mine count.
 *
 * First-click safety: (safeRow, safeCol) — the cell the player just
 * clicked — and all of its neighbors are excluded from mine
 * placement. This guarantees the very first click can never be a
 * mine, and usually opens up a small safe area instead of a
 * one-cell dead end.
 */
export function placeMines(board, mineCount, safeRow, safeCol) {
  const rows = board.length;
  const cols = board[0].length;

  const safeCells = new Set([`${safeRow},${safeCol}`]);
  getNeighbors(board, safeRow, safeCol).forEach((cell) => {
    safeCells.add(`${cell.row},${cell.col}`);
  });

  const candidates = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!safeCells.has(`${row},${col}`)) {
        candidates.push([row, col]);
      }
    }
  }

  // Fisher–Yates shuffle: walk backwards through the array, swapping
  // each element with a random earlier (or same) one. After this,
  // taking the first `mineCount` entries is equivalent to picking
  // `mineCount` random cells with no repeats.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const mineCells = candidates.slice(0, mineCount);

  const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  mineCells.forEach(([row, col]) => {
    newBoard[row][col].isMine = true;
  });

  // For every non-mine cell, count how many of its neighbors are mines.
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (newBoard[row][col].isMine) continue;
      newBoard[row][col].adjacentMines = getNeighbors(newBoard, row, col).filter(
        (cell) => cell.isMine
      ).length;
    }
  }

  return newBoard;
}

/**
 * Reveals (row, col) and, if it has zero adjacent mines, floods
 * outward to reveal its neighbors too — and their neighbors, and so
 * on — stopping automatically at the first ring of cells that DO
 * have a number on them. This is what makes clicking an empty area
 * open up a whole region at once instead of just one cell.
 *
 * Implemented iteratively with a stack rather than recursion, so it
 * can't blow the call stack even on the 16x16 board.
 */
export function revealCell(board, row, col) {
  const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  const stack = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const cell = newBoard[r][c];

    if (cell.isRevealed || cell.isFlagged) continue;

    cell.isRevealed = true;

    // Only keep expanding through cells with NO adjacent mines.
    // A numbered cell (adjacentMines > 0) gets revealed but the
    // flood stops there — that's the border of the opened area.
    if (cell.adjacentMines === 0 && !cell.isMine) {
      getNeighbors(newBoard, r, c).forEach((neighbor) => {
        if (!neighbor.isRevealed && !neighbor.isFlagged) {
          stack.push([neighbor.row, neighbor.col]);
        }
      });
    }
  }

  return newBoard;
}

// Reveals every mine on the board — used when the player loses, so
// the whole minefield is shown.
export function revealAllMines(board) {
  return board.map((r) => r.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell)));
}

// Right-click handler logic: only hidden cells can be flagged.
export function toggleFlag(board, row, col) {
  const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  const cell = newBoard[row][col];
  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }
  return newBoard;
}

export function countFlags(board) {
  return board.flat().filter((cell) => cell.isFlagged).length;
}

// Classic Minesweeper win condition: every cell that ISN'T a mine
// has been revealed. (You don't have to flag every mine to win.)
export function checkWin(board) {
  return board.flat().every((cell) => cell.isMine || cell.isRevealed);
}

// Picks a random hidden, unflagged, non-mine cell for the Hint
// button to reveal. Returns null if no such cell exists.
export function findHintCell(board) {
  const candidates = board.flat().filter(
    (cell) => !cell.isMine && !cell.isRevealed && !cell.isFlagged
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Score = 1000 - (time in seconds x 5) - (hints used x HINT_COST), floored at 0.
export function calculateScore(timeElapsed, hintsUsed) {
  const rawScore = 1000 - timeElapsed * 5 - hintsUsed * HINT_COST;
  return Math.max(0, rawScore);
}
