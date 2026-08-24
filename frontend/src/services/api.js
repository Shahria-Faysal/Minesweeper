
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/backend";


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
