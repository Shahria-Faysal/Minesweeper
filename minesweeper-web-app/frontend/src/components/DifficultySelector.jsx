import { DIFFICULTIES } from "../utils/minesweeper";

function DifficultySelector({ difficulty, onChange }) {
  return (
    <div className="difficulty-selector">
      {Object.entries(DIFFICULTIES).map(([key, config]) => (
        <button
          key={key}
          type="button"
          className={key === difficulty ? "difficulty-active" : ""}
          onClick={() => onChange(key)}
        >
          {config.label} ({config.rows}×{config.cols}, {config.mines} mines)
        </button>
      ))}
    </div>
  );
}

export default DifficultySelector;
