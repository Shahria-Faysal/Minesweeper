import Cell from "./Cell";

function MinesweeperBoard({ board, gameStatus, hintCell, onReveal, onFlag, onChord }) {
  const columnCount = board[0].length;

  return (
    <div className="board" style={{ "--board-cols": columnCount }}>
      {board.flat().map((cell) => (
        <Cell
          key={`${cell.row}-${cell.col}`}
          cell={cell}
          gameStatus={gameStatus}
          isHinted={hintCell?.row === cell.row && hintCell?.col === cell.col}
          onReveal={onReveal}
          onFlag={onFlag}
          onChord={onChord}
        />
      ))}
    </div>
  );
}

export default MinesweeperBoard;
