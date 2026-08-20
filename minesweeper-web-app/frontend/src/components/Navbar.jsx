import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";

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

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <Link to="/">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <span className="navbar-user">Hi, {user.username}</span>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/game">Play</Link>
      <Link to="/leaderboard">Leaderboard</Link>
      <Link to="/history">History</Link>
      <Link to="/profile">Profile</Link>
      <button type="button" className="navbar-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
