const mongoose = require("mongoose");

const findingSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    value: { type: String, required: true },
    risk: { type: String, required: true },
    line: { type: Number, required: true },
    context: { type: String, default: "" },
    masked: { type: String, default: "" },
  },
  { _id: false },
);

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    inputType: { type: String, required: true },
    contentType: { type: String, required: true },
    summary: { type: String, required: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, required: true },
    action: { type: String, required: true },
    findings: { type: [findingSchema], default: [] },
    insights: { type: [String], default: [] },
    options: {
      mask: { type: Boolean, default: true },
      blockHighRisk: { type: Boolean, default: true },
      logAnalysis: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Analysis", analysisSchema);
