import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Login</Link>
      <Link to="/register">Register</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/game">Game</Link>
      <Link to="/leaderboard">Leaderboard</Link>
      <Link to="/history">History</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}

export default Navbar;
