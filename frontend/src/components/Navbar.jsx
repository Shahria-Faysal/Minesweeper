import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";
import ThemeToggle from "./ThemeToggle";

/** Inline mine SVG — uses currentColor so it inherits from .navbar-brand */
function MineLogo() {
  return (
    <svg
      className="navbar-logo-svg"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="16" cy="17" r="9" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="17" r="6" fill="currentColor" opacity="0.9" />
      <line x1="16" y1="4"  x2="16" y2="8"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4"  y1="17" x2="8"  y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="17" x2="28" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="7.5"  y1="8.5"  x2="10.5" y2="11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="21.5" y1="22.5" x2="24.5" y2="25.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24.5" y1="8.5"  x2="21.5" y2="11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="10.5" y1="22.5" x2="7.5"  y2="25.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="13.5" cy="14.5" r="1.5" fill="white" opacity="0.55" />
    </svg>
  );
}

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef(null);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Trap focus / close on Escape
  useEffect(() => {
    if (!menuOpen) return;

    function handleKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", handleKey);
    // Prevent body scroll while overlay is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await logoutUser();
    } catch {
      // Even if the network request fails, still clear local state.
    } finally {
      logout();
      navigate("/");
    }
  }

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">

        {/* ── Brand ── */}
        <NavLink
          to={isAuthenticated ? "/dashboard" : "/"}
          end
          className="navbar-brand"
          id="navbar-brand-link"
          aria-label="Minesweeper SYS home"
        >
          <MineLogo />
          <span className="navbar-brand-text">
            <span className="navbar-brand-main">MINESWEEPER</span>
            <span className="navbar-brand-sub">SYS · v1.0</span>
          </span>
        </NavLink>

        {/* ── Desktop nav links ── */}
        <div className="navbar-links" aria-label="Site pages">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard"   id="nav-dashboard">Dashboard</NavLink>
              <NavLink to="/game"        id="nav-play">Play</NavLink>
              <NavLink to="/leaderboard" id="nav-leaderboard">Leaderboard</NavLink>
              <NavLink to="/history"     id="nav-history">History</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end   id="nav-login">Login</NavLink>
              <NavLink to="/register" id="nav-register">Register</NavLink>
            </>
          )}
        </div>

        {/* ── Desktop right-side actions ── */}
        <div className="navbar-actions">
          {isAuthenticated && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `navbar-avatar-btn${isActive ? " navbar-avatar-btn--active" : ""}`
              }
              id="nav-profile"
              aria-label={`Your profile: ${user.username}`}
            >
              <span className="navbar-avatar-initials" aria-hidden="true">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <span className="navbar-avatar-name">{user.username}</span>
              <span className="navbar-avatar-chevron" aria-hidden="true">▾</span>
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

        {/* ── Burger button (mobile only) ── */}
        <button
          type="button"
          className={`navbar-burger${menuOpen ? " navbar-burger--open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="navbar-mobile-overlay"
          aria-label="Open navigation menu"
          id="btn-burger"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ── Mobile overlay drawer ── */}
      <div
        id="navbar-mobile-overlay"
        ref={overlayRef}
        className={`navbar-mobile-overlay${menuOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Close × */}
        <button
          type="button"
          className="navbar-mobile-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard"   id="mobile-nav-dashboard">Dashboard</NavLink>
            <NavLink to="/game"        id="mobile-nav-play">▶ Play Game</NavLink>
            <NavLink to="/leaderboard" id="mobile-nav-leaderboard">Leaderboard</NavLink>
            <NavLink to="/history"     id="mobile-nav-history">History</NavLink>
            <NavLink to="/profile"     id="mobile-nav-profile">Profile</NavLink>
            <button type="button" onClick={handleLogout} id="mobile-btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/" end      id="mobile-nav-login">Login</NavLink>
            <NavLink to="/register"  id="mobile-nav-register">Register</NavLink>
          </>
        )}

        <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}

export default Navbar;
