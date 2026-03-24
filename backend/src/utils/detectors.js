const RISK_WEIGHTS = {
  low: 1,
  medium: 3,
  high: 5,
  critical: 8,
};

const PATTERNS = [
  {
    type: "email",
    risk: "low",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    type: "phone",
    risk: "medium",
    regex: /\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}\b/g,
  },
  {
    type: "api_key",
    risk: "high",
    regex:
      /\b(?:api[_-]?key|x-api-key)\s*[:=]\s*([A-Za-z0-9_\-]{8,}|sk-[A-Za-z0-9_\-]{8,})\b/gi,
  },
  {
    type: "password",
    risk: "critical",
    regex: /\b(?:password|passwd|pwd)\s*[:=]\s*[^\s,;]+/gi,
  },
  {
    type: "token",
    risk: "high",
    regex: /\b(?:token|bearer)\s*[:=]?\s*[A-Za-z0-9\-_.]{10,}\b/gi,
  },
  {
    type: "hardcoded_secret",
    risk: "critical",
    regex: /\b(?:secret|private[_-]?key|client[_-]?secret)\s*[:=]\s*[^\s,;]+/gi,
  },
  {
    type: "stack_trace",
    risk: "medium",
    regex: /\b(?:Exception|Traceback|at\s+[\w$.]+\([^)]*\)|stack trace)\b/gi,
  },
  {
    type: "failed_login",
    risk: "high",
    regex:
      /\b(?:failed\s+login|login\s+failed|invalid\s+credentials|unauthorized)\b/gi,
  },
  {
    type: "suspicious_ip",
    risk: "medium",
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  },
];

const maskValue = (value) => {
  if (!value) {
    return value;
  }

  if (value.length <= 6) {
    return "*".repeat(value.length);
  }

  return `${value.slice(0, 2)}${"*".repeat(Math.max(4, value.length - 4))}${value.slice(-2)}`;
};

const getRiskLevel = (score) => {
  if (score >= 16) {
    return "critical";
  }
  if (score >= 10) {
    return "high";
  }
  if (score >= 5) {
    return "medium";
  }
  return "low";
};

const detectFindings = (content) => {
  const findings = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    PATTERNS.forEach((pattern) => {
      pattern.regex.lastIndex = 0;
      let match = pattern.regex.exec(line);

      while (match) {
        const rawValue = match[0];

        findings.push({
          type: pattern.type,
          value: rawValue,
          risk: pattern.risk,
          line: index + 1,
          context: line.trim().slice(0, 220),
          masked: maskValue(rawValue),
        });

        match = pattern.regex.exec(line);
      }
    });
  });

  return findings;
};

module.exports = {
  RISK_WEIGHTS,
  detectFindings,
  getRiskLevel,
  maskValue,
};
