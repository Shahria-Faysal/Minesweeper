import { useState, useEffect } from "react";
import { useMinesweeper } from "../hooks/useMinesweeper";
import { DIFFICULTIES } from "../utils/minesweeper";
import { fetchStats } from "../services/gameService";
import DifficultySelector from "../components/DifficultySelector";
import MinesweeperBoard from "../components/MinesweeperBoard";
import ResultModal from "../components/ResultModal";
import "./Game.css";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function Game() {
  const {
    difficulty,
    board,
    gameStatus,
    timeElapsed,
    hintsUsed,
    hintsRemaining,
    hintCell,
    minesRemaining,
    cellsRevealed,
    score,
    saveStatus,
    changeDifficulty,
    restart,
    revealCellAt,
    flagCellAt,
    useHint,
  } = useMinesweeper();

  const hintDisabled = gameStatus !== "playing" || hintsRemaining <= 0;

  // The score to beat for THIS difficulty, loaded before the game
  // finishes so it can be compared against it. null = no games yet
  // (or not loaded), which means any score counts as a new best.
  const [previousBest, setPreviousBest] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);

  // Load (or reload) the personal-best baseline whenever the
  // difficulty changes — including on mount.
  useEffect(() => {
    let cancelled = false;

    fetchStats(difficulty)
      .then((data) => {
        if (!cancelled) setPreviousBest(data.stats.highestScore);
      })
      .catch(() => {
        if (!cancelled) setPreviousBest(null);
      });

    return () => {
      cancelled = true;
    };
  }, [difficulty]);

  // The instant a game ends, compare its score against the baseline
  // captured above. This runs once per game (gameStatus only flips
  // to "lost" once), so it correctly compares against the score as
  // it stood BEFORE this game, not after.
  useEffect(() => {
    if (gameStatus === "lost") {
      setIsNewBest(previousBest === null || score > previousBest);
    } else if (gameStatus === "ready") {
      setIsNewBest(false); // reset the banner for the next game
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  // Once the game is actually confirmed saved, fold it into the
  // local baseline — so restarting the SAME difficulty compares the
  // next game against the truly latest best, without needing another
  // network round trip.
  useEffect(() => {
    if (gameStatus === "lost" && saveStatus === "saved") {
      setPreviousBest((prev) => (prev === null || score > prev ? score : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveStatus]);

  return (
    <div className="page">
      <div className="header-flex">
        <div>
          <h2>OPERATOR CONSOLE</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
            SYSTEM STATUS: ACTIVE
          </p>
        </div>
        <div className="game-actions">
          <button
            type="button"
            className="btn"
            onClick={useHint}
            disabled={hintDisabled}
            style={{ marginRight: "0.5rem" }}
          >
            💡 HINT ({hintsRemaining})
          </button>
          <button type="button" className="btn btn-primary" onClick={restart}>
            🔄 RESTART
          </button>
        </div>
      </div>

      <DifficultySelector difficulty={difficulty} onChange={changeDifficulty} />

      <div className="game-area">
        <div className="status-bar">
          <div>DIFFICULTY: <span>{DIFFICULTIES[difficulty].label.toUpperCase()}</span></div>
          <div>MINES: <span>{minesRemaining}</span></div>
          <div>TIME: <span>{formatTime(timeElapsed)}</span></div>
          <div>SCORE: <span>{score}</span></div>
        </div>

        <MinesweeperBoard
          board={board}
          gameStatus={gameStatus}
          hintCell={hintCell}
          onReveal={revealCellAt}
          onFlag={flagCellAt}
        />
      </div>

      <ResultModal
        gameStatus={gameStatus}
        score={score}
        timeElapsed={timeElapsed}
        cellsRevealed={cellsRevealed}
        hintsUsed={hintsUsed}
        saveStatus={saveStatus}
        isNewBest={isNewBest}
        onRestart={restart}
      />
    </div>
  );
}

export default Game;
