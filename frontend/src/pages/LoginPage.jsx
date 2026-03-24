import { Link, Navigate } from "react-router-dom";
import { useState } from "react";

function LoginPage({ token, isAuthLoading, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (token) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await onLogin({ email, password });
    } catch (apiError) {
      setError(apiError.message || "Login failed");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-atmosphere" />
      <div className="auth-card-modern">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          Sign in to continue secure data analysis.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />

          <button type="submit" disabled={isAuthLoading}>
            {isAuthLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}

        <p className="auth-footnote">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
