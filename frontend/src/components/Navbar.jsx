import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      // Even if the network request fails, still clear local state
      // below so the UI doesn't get stuck showing a logged-in user.
    } finally {
      logout();
      navigate("/");
    }
  }

  return (
    <nav className="navbar">
      <NavLink to={isAuthenticated ? "/dashboard" : "/"} end className="navbar-brand">
        [MINESWEEPER_SYS]
      </NavLink>

      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/game">Play</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" end>
              Login
            </NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>

      <div className="navbar-actions">
        {isAuthenticated && <span className="navbar-user">Hi, {user.username}</span>}
        {isAuthenticated && (
          <button type="button" className="btn navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
