import { useState, useEffect, useCallback, useRef } from "react";
import {
  DIFFICULTIES,
  MAX_HINTS,
  HINT_HIGHLIGHT_MS,
  createEmptyBoard,
  placeMines,
  revealCell,
  revealAllMines,
  toggleFlag,
  countFlags,
  checkWin,
  findHintCell,
  calculateScore,
} from "../utils/minesweeper";

/**
 * Owns all Minesweeper state and exposes the actions a page needs.
 *
 * gameStatus moves through: "ready" -> "playing" -> "won" | "lost"
 *   ready:   board exists, but mines aren't placed yet (waiting for
 *            the first click so first-click safety can work)
 *   playing: mines are placed, timer is running
 *   won/lost: game over, timer stopped
 */
export function useMinesweeper(initialDifficulty = "beginner") {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const config = DIFFICULTIES[difficulty];

  const [board, setBoard] = useState(() => createEmptyBoard(config.rows, config.cols));
  const [gameStatus, setGameStatus] = useState("ready");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  // The cell a hint most recently pointed at, so the UI can
  // highlight it — separate from `board`, since a hint does NOT
  // reveal anything.
  const [hintCell, setHintCell] = useState(null);

  const timerRef = useRef(null);
  const hintTimeoutRef = useRef(null);

  // Timer only ticks while gameStatus === "playing". Cleans itself
  // up whenever gameStatus changes (including to won/lost) or the
  // component unmounts.
  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        setTimeElapsed((seconds) => seconds + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStatus]);

  // Clear any pending hint-highlight timeout on unmount.
  useEffect(() => {
    return () => clearTimeout(hintTimeoutRef.current);
  }, []);

  function clearHintHighlight() {
    clearTimeout(hintTimeoutRef.current);
    setHintCell(null);
  }

  const resetGame = useCallback((nextDifficulty) => {
    const targetDifficulty = nextDifficulty ?? difficulty;
    const targetConfig = DIFFICULTIES[targetDifficulty];

    clearTimeout(hintTimeoutRef.current);
    setHintCell(null);
    setDifficulty(targetDifficulty);
    setBoard(createEmptyBoard(targetConfig.rows, targetConfig.cols));
    setGameStatus("ready");
    setTimeElapsed(0);
    setHintsUsed(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  function revealCellAt(row, col) {
    if (gameStatus === "won" || gameStatus === "lost") return;

    const targetCell = board[row][col];
    if (targetCell.isRevealed || targetCell.isFlagged) return;

    // Any real reveal makes a stale hint highlight pointless.
    clearHintHighlight();

    let workingBoard = board;

    // First reveal of the game: this is when mines actually get
    // placed, guaranteed safe around the cell just clicked.
    if (gameStatus === "ready") {
      workingBoard = placeMines(board, config.mines, row, col);
      setGameStatus("playing");
    }

    if (workingBoard[row][col].isMine) {
      setBoard(revealAllMines(revealCell(workingBoard, row, col)));
      setGameStatus("lost");
      return;
    }

    const nextBoard = revealCell(workingBoard, row, col);
    setBoard(nextBoard);

    if (checkWin(nextBoard)) {
      setGameStatus("won");
    }
  }

  function flagCellAt(row, col) {
    if (gameStatus === "won" || gameStatus === "lost") return;
    setBoard((prevBoard) => toggleFlag(prevBoard, row, col));
  }

  /**
   * Points out a safe cell WITHOUT revealing it: picks a random
   * hidden, unflagged, non-mine cell and stores it as `hintCell` so
   * the board can highlight it. The highlight clears itself after
   * HINT_HIGHLIGHT_MS, or immediately if the player reveals any
   * cell first. Capped at MAX_HINTS per game; each use costs
   * HINT_COST points (applied via calculateScore below).
   */
  function useHint() {
    if (gameStatus !== "playing") return;
    if (hintsUsed >= MAX_HINTS) return;

    const cell = findHintCell(board);
    if (!cell) return;

    clearTimeout(hintTimeoutRef.current);
    setHintCell({ row: cell.row, col: cell.col });
    setHintsUsed((count) => count + 1);

    hintTimeoutRef.current = setTimeout(() => {
      setHintCell(null);
    }, HINT_HIGHLIGHT_MS);
  }

  const flagCount = countFlags(board);
  const minesRemaining = config.mines - flagCount;
  const score = calculateScore(timeElapsed, hintsUsed);
  const hintsRemaining = MAX_HINTS - hintsUsed;

  return {
    difficulty,
    config,
    board,
    gameStatus,
    timeElapsed,
    hintsUsed,
    hintsRemaining,
    hintCell,
    minesRemaining,
    score,
    changeDifficulty: resetGame,
    restart: () => resetGame(),
    revealCellAt,
    flagCellAt,
    useHint,
  };
}
