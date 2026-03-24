const {
  RISK_WEIGHTS,
  detectFindings,
  getRiskLevel,
} = require("../utils/detectors");
const { tryGenerateOpenRouterInsights } = require("./openrouter");

const SUPPORTED_INPUT_TYPES = new Set(["text", "file", "sql", "chat", "log"]);

const summarizeFindings = (findings) => {
  if (!findings.length) {
    return "No sensitive patterns were detected in the provided content.";
  }

  const counts = findings.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => `${count} ${type.replace(/_/g, " ")}`)
    .join(", ");

  return `Detected ${findings.length} issues, including ${top}.`;
};

const buildInsights = (findings, riskLevel) => {
  if (!findings.length) {
    return [
      "No immediate security leak found in this input.",
      "Continue monitoring logs for repeated authentication errors and secret exposure.",
    ];
  }

  const insights = [];
  const hasCredentials = findings.some((item) =>
    ["password", "api_key", "token", "hardcoded_secret"].includes(item.type),
  );
  const hasTrace = findings.some((item) => item.type === "stack_trace");
  const hasFailures = findings.some((item) => item.type === "failed_login");

  if (hasCredentials) {
    insights.push(
      "Sensitive credentials are exposed in logs and should be removed or masked immediately.",
    );
  }
  if (hasTrace) {
    insights.push(
      "Stack traces reveal internal implementation details and increase exploitability.",
    );
  }
  if (hasFailures) {
    insights.push(
      "Repeated authentication failure patterns may indicate brute-force activity.",
    );
  }

  insights.push(
    `Overall risk is ${riskLevel}. Prioritize remediation for high and critical findings first.`,
  );

  return insights;
};

const analyzeContent = async ({ inputType, content, options }) => {
  if (!SUPPORTED_INPUT_TYPES.has(inputType)) {
    throw new Error("input_type must be one of text | file | sql | chat | log");
  }

  if (!content || typeof content !== "string") {
    throw new Error("content must be a non-empty string");
  }

  const normalizedOptions = {
    mask: options?.mask !== false,
    blockHighRisk: options?.block_high_risk !== false,
    logAnalysis: options?.log_analysis !== false,
  };

  const findings = detectFindings(content).map((finding) => ({
    ...finding,
    value: normalizedOptions.mask ? finding.masked : finding.value,
  }));

  const riskScore = findings.reduce(
    (sum, item) => sum + (RISK_WEIGHTS[item.risk] || 0),
    0,
  );
  const riskLevel = getRiskLevel(riskScore);
  let summary = summarizeFindings(findings);
  let insights = buildInsights(findings, riskLevel);

  const aiInsights = await tryGenerateOpenRouterInsights({
    findings,
    riskLevel,
    riskScore,
    content,
  });

  if (aiInsights?.summary) {
    summary = aiInsights.summary;
  }

  if (aiInsights?.insights?.length) {
    insights = aiInsights.insights;
  }

  let action = "allowed";
  if (normalizedOptions.mask && findings.length > 0) {
    action = "masked";
  }
  if (
    normalizedOptions.blockHighRisk &&
    ["high", "critical"].includes(riskLevel)
  ) {
    action = "blocked";
  }

  return {
    summary,
    content_type:
      inputType === "log" || inputType === "file" ? "logs" : inputType,
    findings,
    risk_score: riskScore,
    risk_level: riskLevel,
    action,
    insights,
    options: normalizedOptions,
    ai_provider: aiInsights ? "openrouter" : "rule-engine",
    ai_model: aiInsights?.model || null,
  };
};

module.exports = {
  analyzeContent,
};
