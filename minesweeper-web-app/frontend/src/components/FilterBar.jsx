/**
 * Shared by Leaderboard and Dashboard — both needed the same
 * "row of filter buttons, one active at a time" pattern, so it lives
 * here once instead of being copy-pasted in each page.
 */
function FilterBar({ options, active, onChange }) {
  return (
    <div className="filter-bar">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={option.key === active ? "btn btn-active" : "btn"}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
