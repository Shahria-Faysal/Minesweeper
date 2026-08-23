import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const justRegistered = Boolean(location.state?.registered);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await loginUser({ email, password });
      // Only non-sensitive identity fields go into frontend state —
      // never the password.
      login(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h2>OPERATOR LOGIN</h2>

      {justRegistered && (
        <p className="form-success">Registration successful! Please log in.</p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email Address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>

        <label>
          Security Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Authenticating..." : "Establish Connection"}
        </button>
      </form>

      <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        No credential profile? <Link to="/register" style={{ color: "var(--accent)", fontWeight: "bold" }}>Register Operator</Link>
      </p>
    </div>
  );
}

export default Login;
