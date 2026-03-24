import { Link, Navigate } from "react-router-dom";
import { useState } from "react";

function SignupPage({ token, isAuthLoading, onSignup }) {
  const [name, setName] = useState("");
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
      await onSignup({ name, email, password });
    } catch (apiError) {
      setError(apiError.message || "Signup failed");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-atmosphere" />
      <div className="auth-card-modern">
        <h1>Create Account</h1>
        <p className="auth-subtitle">
          Register to access the intelligence dashboard.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />

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
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />

          <button type="submit" disabled={isAuthLoading}>
            {isAuthLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}

        <p className="auth-footnote">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
