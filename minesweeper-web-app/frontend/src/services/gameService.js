import { apiPost, apiGet } from "./api";

/**
 * Sends a finished game's result to the backend.
 *
 * Deliberately does NOT include a user id — the backend identifies
 * the player from the PHP session cookie
 * (credentials: "include", handled by apiPost), never from anything
 * this function sends.
 */
export function saveGameResult({ difficulty, score, timeTaken, result, hintsUsed }) {
  return apiPost("save-score.php", {
    difficulty,
    score,
    time_taken: timeTaken,
    result,
    hints_used: hintsUsed,
  });
}

// difficulty: "all" | "beginner" | "advanced"
export function fetchLeaderboard(difficulty = "all") {
  return apiGet("leaderboard.php", { difficulty });
}

// Always the logged-in user's own games — the backend ignores any
// user id and reads $_SESSION['user_id'] instead.
export function fetchHistory() {
  return apiGet("history.php");
}

// difficulty: "all" | "beginner" | "advanced"
export function fetchStats(difficulty = "all") {
  return apiGet("stats.php", { difficulty });
}
