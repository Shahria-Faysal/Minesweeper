import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/tables.css";

function Profile() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Profile</h1>
      <p className="profile-username">{user.username}</p>
      <p className="dashboard-subtitle">
        Want to see how you're doing? Check your <Link to="/dashboard">stats on the Dashboard</Link>.
      </p>
    </div>
  );
}

export default Profile;
