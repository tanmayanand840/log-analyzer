const express = require("express");
const Analysis = require("../models/Analysis");
const { analyzeContent } = require("../services/analyzer");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/analyze", requireAuth, async (req, res) => {
  try {
    const { input_type: inputType, content, options } = req.body || {};

    const result = await analyzeContent({ inputType, content, options });

    let analysisId = null;
    if (Analysis.db.readyState === 1) {
      const saved = await Analysis.create({
        inputType,
        contentType: result.content_type,
        summary: result.summary,
        riskScore: result.risk_score,
        riskLevel: result.risk_level,
        action: result.action,
        findings: result.findings,
        insights: result.insights,
        options: {
          mask: result.options.mask,
          blockHighRisk: result.options.blockHighRisk,
          logAnalysis: result.options.logAnalysis,
        },
        userId: req.user.id,
      });
      analysisId = saved._id;
    }

    return res.status(200).json({
      ...result,
      analysis_id: analysisId,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to analyze content",
    });
  }
});

router.get("/analyses", requireAuth, async (req, res) => {
  try {
    const records = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select(
        "summary riskScore riskLevel action inputType contentType createdAt",
      );

    return res.status(200).json({ analyses: records });
  } catch (_error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch analysis history" });
  }
});

module.exports = router;
