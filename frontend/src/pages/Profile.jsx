import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/tables.css";

function Profile() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="header-flex">
        <div>
          <h2>OPERATOR PROFILE</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
            IDENTITY READOUT
          </p>
        </div>
      </div>
      <p className="profile-username" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent)", margin: "1rem 0" }}>
        {user.username.toUpperCase()}
      </p>
      <p className="dashboard-subtitle">
        Want to see how you're doing? Check your <Link to="/dashboard">stats on the Dashboard</Link>.
      </p>
    </div>
  );
}

export default Profile;
