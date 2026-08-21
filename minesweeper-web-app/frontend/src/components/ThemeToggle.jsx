import { useTheme } from "../hooks/useTheme";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="btn theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      {isDark ? "🌙 Dark" : "☀ Light"}
    </button>
  );
}

export default ThemeToggle;
