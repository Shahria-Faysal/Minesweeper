import { createContext, useState } from "react";

// Only non-sensitive identity fields ever live here — never the password.
const STORAGE_KEY = "minesweeper_user";

export const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Tracks who the frontend believes is logged in.
 *
 * This is UI-convenience state, not the source of truth — the PHP
 * session cookie is. login() is called after the backend confirms a
 * successful login (see login.php), never before. Restoring `user`
 * from localStorage on refresh just avoids flashing a logged-out
 * navbar while the page loads; any real data request still relies on
 * the PHP session cookie, and the backend will reject it with 401 if
 * that session has expired.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  function login(userData) {
    // userData: { id, username } — from the login API response
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
