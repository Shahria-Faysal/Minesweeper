import { useMinesweeper } from "../hooks/useMinesweeper";
import { DIFFICULTIES, MAX_HINTS } from "../utils/minesweeper";
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
    hintCell,
    minesRemaining,
    score,
    changeDifficulty,
    restart,
    revealCellAt,
    flagCellAt,
    useHint,
  } = useMinesweeper();

  const hintDisabled = gameStatus !== "playing" || hintsUsed >= MAX_HINTS;

  return (
    <div className="page">
      <h1>Minesweeper</h1>

      <DifficultySelector difficulty={difficulty} onChange={changeDifficulty} />

      <GameHeader
        difficultyLabel={DIFFICULTIES[difficulty].label}
        minesRemaining={minesRemaining}
        timeElapsed={timeElapsed}
        score={score}
        hintsUsed={hintsUsed}
        maxHints={MAX_HINTS}
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
        onRestart={restart}
      />
    </div>
  );
}

export default Game;
