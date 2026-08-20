import Cell from "./Cell";

function MinesweeperBoard({ board, gameStatus, onReveal, onFlag }) {
  const columnCount = board[0].length;

  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${columnCount}, 2rem)` }}
    >
      {board.flat().map((cell) => (
        <Cell
          key={`${cell.row}-${cell.col}`}
          cell={cell}
          gameStatus={gameStatus}
          onReveal={onReveal}
          onFlag={onFlag}
        />
      ))}
    </div>
  );
}

export default MinesweeperBoard;
