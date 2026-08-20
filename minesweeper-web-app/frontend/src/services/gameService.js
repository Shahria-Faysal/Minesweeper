import { apiPost } from "./api";

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
