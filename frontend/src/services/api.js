// Base URL of the PHP backend.
// Configurable via VITE_API_BASE_URL in a .env file (copy
// .env.example to .env and adjust) — falls back to the default
// XAMPP layout if no .env is present, so nothing breaks out of the box.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/backend";

/**
 * Shared fetch wrapper for talking to the PHP API.
 *
 * `credentials: "include"` is what makes the browser send and store
 * the PHP session cookie (PHPSESSID) across requests — without it,
 * login.php would still succeed, but the browser would never keep
 * the cookie, so the next request would look logged-out again.
 */
export async function apiPost(endpoint, body) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

/**
 * Same idea as apiPost, but for read-only GET requests (leaderboard,
 * history, stats). `params` becomes the query string.
 */
export async function apiGet(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/${endpoint}${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}
