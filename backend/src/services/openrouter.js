const axios = require("axios");

const getOpenRouterConfig = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const siteUrl = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
  const siteName =
    process.env.OPENROUTER_SITE_NAME || "AI Secure Data Intelligence Platform";

  return { apiKey, model, siteUrl, siteName };
};

const createPrompt = ({ findings, riskLevel, riskScore, content }) => {
  const compactFindings = findings.slice(0, 20).map((item) => ({
    type: item.type,
    risk: item.risk,
    line: item.line,
    value: item.value,
  }));

  return [
    "You are a security log analyst.",
    "Return strict JSON only with schema:",
    '{"summary":"string","insights":["string","string","string"]}',
    "Summary must be specific and concise.",
    "Insights must be action-focused and non-generic.",
    `riskLevel=${riskLevel}, riskScore=${riskScore}`,
    `findings=${JSON.stringify(compactFindings)}`,
    `content_sample=${JSON.stringify(content.slice(0, 2000))}`,
  ].join("\n");
};

const tryGenerateOpenRouterInsights = async ({
  findings,
  riskLevel,
  riskScore,
  content,
}) => {
  const { apiKey, model, siteUrl, siteName } = getOpenRouterConfig();

  if (!apiKey) {
    return null;
  }

  const payload = {
    model,
    messages: [
      {
        role: "user",
        content: createPrompt({ findings, riskLevel, riskScore, content }),
      },
    ],
    temperature: 0.2,
    max_tokens: 280,
  };

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": siteName,
        },
        timeout: 15000,
      },
    );

    const text = response?.data?.choices?.[0]?.message?.content;
    if (!text) {
      return null;
    }

    const jsonTextMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonTextMatch ? jsonTextMatch[0] : text);
    if (
      !parsed ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.insights)
    ) {
      return null;
    }

    return {
      summary: parsed.summary,
      insights: parsed.insights
        .filter((item) => typeof item === "string")
        .slice(0, 5),
      model,
    };
  } catch (_error) {
    return null;
  }
};

module.exports = { tryGenerateOpenRouterInsights };
