import { useState, useEffect } from "react";
import { useMinesweeper } from "../hooks/useMinesweeper";
import { DIFFICULTIES } from "../utils/minesweeper";
import { fetchStats } from "../services/gameService";
import DifficultySelector from "../components/DifficultySelector";
import GameHeader from "../components/GameHeader";
import MinesweeperBoard from "../components/MinesweeperBoard";
import ResultModal from "../components/ResultModal";
import "./Game.css";

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
  // finishes so a win can be compared against it. null = no wins yet
  // (or not loaded), which means any win counts as a new best.
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

  // The instant a game is won, compare its score against the
  // baseline captured above. This runs once per game (gameStatus
  // only flips to "won" once), so it correctly compares against the
  // score as it stood BEFORE this game, not after.
  useEffect(() => {
    if (gameStatus === "won") {
      setIsNewBest(previousBest === null || score > previousBest);
    } else if (gameStatus === "ready") {
      setIsNewBest(false); // reset the banner for the next game
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  // Once the win is actually confirmed saved, fold it into the
  // local baseline — so restarting the SAME difficulty compares the
  // next game against the truly latest best, without needing another
  // network round trip.
  useEffect(() => {
    if (gameStatus === "won" && saveStatus === "saved") {
      setPreviousBest((prev) => (prev === null || score > prev ? score : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveStatus]);

  return (
    <div className="page">
      <h1>Minesweeper</h1>

      <DifficultySelector difficulty={difficulty} onChange={changeDifficulty} />

      <GameHeader
        difficultyLabel={DIFFICULTIES[difficulty].label}
        minesRemaining={minesRemaining}
        timeElapsed={timeElapsed}
        score={score}
        hintsRemaining={hintsRemaining}
        onHint={useHint}
        onRestart={restart}
        hintDisabled={hintDisabled}
      />

      <MinesweeperBoard
        board={board}
        gameStatus={gameStatus}
        hintCell={hintCell}
        onReveal={revealCellAt}
        onFlag={flagCellAt}
      />

      <ResultModal
        gameStatus={gameStatus}
        score={score}
        timeElapsed={timeElapsed}
        hintsUsed={hintsUsed}
        saveStatus={saveStatus}
        isNewBest={isNewBest}
        onRestart={restart}
      />
    </div>
  );
}

export default Game;
