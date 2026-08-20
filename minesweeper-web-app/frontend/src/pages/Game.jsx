import { useMinesweeper } from "../hooks/useMinesweeper";
import { DIFFICULTIES } from "../utils/minesweeper";
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
    minesRemaining,
    score,
    changeDifficulty,
    restart,
    revealCellAt,
    flagCellAt,
    useHint,
  } = useMinesweeper();

  return (
    <div className="page">
      <h1>Minesweeper</h1>

      <DifficultySelector difficulty={difficulty} onChange={changeDifficulty} />

      <GameHeader
        difficultyLabel={DIFFICULTIES[difficulty].label}
        minesRemaining={minesRemaining}
        timeElapsed={timeElapsed}
        score={score}
        onHint={useHint}
        onRestart={restart}
        hintDisabled={gameStatus !== "playing"}
      />

      <MinesweeperBoard
        board={board}
        gameStatus={gameStatus}
        onReveal={revealCellAt}
        onFlag={flagCellAt}
      />

      <ResultModal
        gameStatus={gameStatus}
        score={score}
        timeElapsed={timeElapsed}
        onRestart={restart}
      />
    </div>
  );
}

export default Game;
