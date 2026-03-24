import { useMemo, useState } from "react";

const INPUT_TYPES = ["text", "file", "sql", "chat", "log"];

const riskClassMap = {
  low: "chip low",
  medium: "chip medium",
  high: "chip high",
  critical: "chip critical",
};

const normalizeLineMatches = (findings = []) => {
  const map = new Map();
  findings.forEach((item) => {
    const current = map.get(item.line);
    if (
      !current ||
      ["critical", "high", "medium", "low"].indexOf(item.risk) <
        ["critical", "high", "medium", "low"].indexOf(current.risk)
    ) {
      map.set(item.line, { risk: item.risk, types: [item.type] });
    } else {
      current.types.push(item.type);
      map.set(item.line, current);
    }
  });
  return map;
};

function DashboardPage({ user, history, onLogout, onAnalyze }) {
  const [inputType, setInputType] = useState("log");
  const [content, setContent] = useState("");
  const [mask, setMask] = useState(true);
  const [blockHighRisk, setBlockHighRisk] = useState(true);
  const [logAnalysis, setLogAnalysis] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const lineRiskMap = useMemo(
    () => normalizeLineMatches(analysis?.findings),
    [analysis],
  );

  const onFileSelect = async (file) => {
    const validExtensions = [".log", ".txt"];
    const valid = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );
    if (!valid) {
      setError("Only .log and .txt files are allowed.");
      return;
    }

    const text = await file.text();
    setInputType("file");
    setContent(text);
    setError("");
  };

  const onDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await onFileSelect(file);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await onAnalyze({
        inputType,
        content,
        options: {
          mask,
          block_high_risk: blockHighRisk,
          log_analysis: logAnalysis,
        },
      });

      setAnalysis(result);
    } catch (apiError) {
      setError(apiError.message || "Unable to analyze content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-overlay" />
      <header className="topbar">
        <div>
          <h1>AI Secure Data Intelligence Platform</h1>
          <p>Log Analyzer + Risk Engine + AI Insights</p>
        </div>
        <div className="topbar-right">
          <span className="user-pill">{user?.name || "User"}</span>
          <button className="logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="card intake-card">
          <h2>Analyze Data</h2>

          <label className="label">Input Type</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
          >
            {INPUT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label className="label">Upload Log (.log, .txt)</label>
          <div
            className={`dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            <p>Drop file here</p>
            <span>or</span>
            <label className="file-btn">
              Choose file
              <input
                type="file"
                accept=".log,.txt"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    await onFileSelect(file);
                  }
                }}
              />
            </label>
          </div>

          <label className="label">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste logs, text, sql, or chat content"
          />

          <div className="options-row">
            <label>
              <input
                type="checkbox"
                checked={mask}
                onChange={(e) => setMask(e.target.checked)}
              />
              Mask sensitive values
            </label>
            <label>
              <input
                type="checkbox"
                checked={blockHighRisk}
                onChange={(e) => setBlockHighRisk(e.target.checked)}
              />
              Block high-risk output
            </label>
            <label>
              <input
                type="checkbox"
                checked={logAnalysis}
                onChange={(e) => setLogAnalysis(e.target.checked)}
              />
              Enable log analyzer
            </label>
          </div>

          <button className="cta" disabled={isLoading} onClick={handleAnalyze}>
            {isLoading ? "Analyzing..." : "Run Analysis"}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="card result-card">
          <h2>Insights Panel</h2>

          {!analysis ? (
            <p className="empty-state">
              Run an analysis to view summary, risk and findings.
            </p>
          ) : (
            <>
              <div className="metric-grid">
                <article>
                  <h3>Risk Score</h3>
                  <p>{analysis.risk_score}</p>
                </article>
                <article>
                  <h3>Risk Level</h3>
                  <p className={riskClassMap[analysis.risk_level]}>
                    {analysis.risk_level}
                  </p>
                </article>
                <article>
                  <h3>Action</h3>
                  <p>{analysis.action}</p>
                </article>
              </div>

              <div className="summary-card">
                <h3>Summary</h3>
                <p>{analysis.summary}</p>
              </div>

              <div className="summary-card">
                <h3>AI Insights</h3>
                <p className="source">
                  Source: {analysis.ai_provider || "rule-engine"}
                  {analysis.ai_model ? ` (${analysis.ai_model})` : ""}
                </p>
                <ul>
                  {(analysis.insights || []).map((insight, index) => (
                    <li key={`${insight}-${index}`}>{insight}</li>
                  ))}
                </ul>
              </div>

              <div className="findings-card">
                <h3>Detected Findings</h3>
                <div className="findings-list">
                  {(analysis.findings || []).map((item, index) => (
                    <article
                      className="finding"
                      key={`${item.type}-${item.line}-${index}`}
                    >
                      <div>
                        <p className="f-type">{item.type.replace(/_/g, " ")}</p>
                        <p className="f-context">
                          Line {item.line}: {item.value}
                        </p>
                      </div>
                      <span className={riskClassMap[item.risk]}>
                        {item.risk}
                      </span>
                    </article>
                  ))}
                </div>
              </div>

              <div className="log-viewer">
                <h3>Log Visualization</h3>
                <div className="log-lines">
                  {content.split(/\r?\n/).map((line, idx) => {
                    const lineNumber = idx + 1;
                    const riskInfo = lineRiskMap.get(lineNumber);
                    return (
                      <div
                        key={`line-${lineNumber}`}
                        className={`line ${riskInfo ? `line-${riskInfo.risk}` : ""}`}
                      >
                        <span className="ln">
                          {lineNumber.toString().padStart(3, "0")}
                        </span>
                        <span className="lv">{line || " "}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>

        <section className="card history-card">
          <h2>Recent Analysis History</h2>
          {!history.length ? (
            <p className="empty-state">No saved analysis records yet.</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <article key={item._id} className="history-item">
                  <p className="history-summary">{item.summary}</p>
                  <p className="history-meta">
                    {new Date(item.createdAt).toLocaleString()} -{" "}
                    {item.riskLevel} ({item.riskScore})
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
