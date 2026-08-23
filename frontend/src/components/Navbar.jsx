import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";
import ThemeToggle from "./ThemeToggle";

function MineLogo() {
  return (
    <svg
      className="navbar-logo-svg"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Mine body */}
      <circle cx="16" cy="17" r="9" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="17" r="6" fill="currentColor" opacity="0.9" />
      {/* Spikes */}
      <line x1="16" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="17" x2="28" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="7.5" y1="8.5" x2="10.5" y2="11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="21.5" y1="22.5" x2="24.5" y2="25.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24.5" y1="8.5" x2="21.5" y2="11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="10.5" y1="22.5" x2="7.5" y2="25.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Shine dot */}
      <circle cx="13.5" cy="14.5" r="1.5" fill="white" opacity="0.6" />
    </svg>
  );
}

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
      {/* Brand / Logo */}
      <NavLink
        to={isAuthenticated ? "/dashboard" : "/"}
        end
        className="navbar-brand"
        id="navbar-brand-link"
      >
        <MineLogo />
        <span className="navbar-brand-text">
          <span className="navbar-brand-main">MINESWEEPER</span>
          <span className="navbar-brand-sub">SYS</span>
        </span>
      </NavLink>

      {/* Navigation links */}
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" id="nav-dashboard">Dashboard</NavLink>
            <NavLink to="/game" id="nav-play">Play</NavLink>
            <NavLink to="/leaderboard" id="nav-leaderboard">Leaderboard</NavLink>
            <NavLink to="/history" id="nav-history">History</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" end id="nav-login">Login</NavLink>
            <NavLink to="/register" id="nav-register">Register</NavLink>
          </>
        )}
      </div>

      {/* Right-side actions */}
      <div className="navbar-actions">
        {isAuthenticated && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `navbar-avatar-btn${isActive ? " navbar-avatar-btn--active" : ""}`
            }
            id="nav-profile"
            title={`Profile: ${user.username}`}
          >
            <span className="navbar-avatar-initials">
              {user.username.charAt(0).toUpperCase()}
            </span>
            <span className="navbar-avatar-name">{user.username}</span>
            <span className="navbar-avatar-chevron">▾</span>
          </NavLink>
        )}
        {isAuthenticated && (
          <button
            type="button"
            className="btn navbar-logout"
            onClick={handleLogout}
            id="btn-logout"
          >
            Logout
          </button>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
