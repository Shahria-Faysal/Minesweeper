import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Welcome, {user.username}. Stats and game history will appear here in a later phase.</p>
    </div>
  );
}

export default Dashboard;
