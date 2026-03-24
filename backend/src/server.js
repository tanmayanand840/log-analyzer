const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const analyzeRoutes = require("./routes/analyzeRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "AI Secure Data Intelligence Platform API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", analyzeRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
};

startServer();
