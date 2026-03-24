import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

const apiBaseUrl =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api");

const parseApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return bodyText ? JSON.parse(bodyText) : {};
    } catch {
      throw new Error("Server returned invalid JSON response.");
    }
  }

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}). Check REACT_APP_API_URL and backend deployment.`,
    );
  }

  throw new Error("Expected JSON response but received non-JSON content.");
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const saveSession = (sessionToken, user) => {
    setToken(sessionToken);
    setCurrentUser(user);
    localStorage.setItem("token", sessionToken);
  };

  const clearSession = () => {
    setToken("");
    setCurrentUser(null);
    setHistory([]);
    localStorage.removeItem("token");
  };

  const fetchHistory = async (sessionToken) => {
    const response = await fetch(`${apiBaseUrl}/analyses`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!response.ok) {
      return;
    }

    const data = await parseApiResponse(response);
    setHistory(data.analyses || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        return;
      }

      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        clearSession();
        return;
      }

      const data = await parseApiResponse(response);
      setCurrentUser(data.user);
      await fetchHistory(token);
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuth = async (endpoint, payload) => {
    setIsAuthLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      saveSession(data.token, data.user);
      await fetchHistory(data.token);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const onLogin = async ({ email, password }) =>
    handleAuth("login", { email, password });

  const onSignup = async ({ name, email, password }) =>
    handleAuth("register", { name, email, password });

  const onAnalyze = async ({ inputType, content, options }) => {
    if (!token) {
      throw new Error("Please log in first to run analysis.");
    }

    const response = await fetch(`${apiBaseUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        input_type: inputType,
        content,
        options,
      }),
    });

    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.message || "Unable to analyze content");
    }

    await fetchHistory(token);
    return data;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage token={token} />} />
        <Route
          path="/login"
          element={
            <LoginPage
              token={token}
              isAuthLoading={isAuthLoading}
              onLogin={onLogin}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignupPage
              token={token}
              isAuthLoading={isAuthLoading}
              onSignup={onSignup}
            />
          }
        />
        <Route
          path="/app"
          element={
            token ? (
              <DashboardPage
                user={currentUser}
                history={history}
                onLogout={clearSession}
                onAnalyze={onAnalyze}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
