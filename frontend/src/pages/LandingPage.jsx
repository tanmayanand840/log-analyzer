import { Link } from "react-router-dom";

function LandingPage({ token }) {
  return (
    <div className="landing-layout">
      <div className="landing-backdrop" />
      <div className="landing-grid">
        <section className="landing-hero">
          <p className="landing-kicker">AI Security Intelligence</p>
          <h1>
            Detect risky data signals
            <span>before they become incidents.</span>
          </h1>
          <p className="landing-copy">
            Analyze logs, text, SQL snippets, and chat transcripts with a fast
            risk engine that highlights sensitive leaks and suspicious patterns.
          </p>

          <div className="landing-actions">
            {token ? (
              <Link to="/app" className="landing-btn landing-btn-primary">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="landing-btn landing-btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="landing-btn landing-btn-secondary">
                  Login
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="landing-panel">
          <article className="preview-card card-1">
            <p className="preview-label">Live Detection</p>
            <h3>PII + Secrets Scanner</h3>
            <p>
              Finds emails, API keys, credentials, and suspicious stack traces
              in real-time.
            </p>
          </article>

          <article className="preview-card card-2">
            <p className="preview-label">Risk Decisions</p>
            <h3>Actionable Risk Levels</h3>
            <p>
              Understand severity with low, medium, high, and critical scoring
              powered by intelligent rules.
            </p>
          </article>

          <article className="preview-card card-3">
            <p className="preview-label">Fast Workflow</p>
            <h3>Upload, Analyze, Report</h3>
            <p>
              Drop .log or .txt files and instantly get summaries and insights
              for safer operations.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
