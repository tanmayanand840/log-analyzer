const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const ensureDbConnected = (res) => {
  if (User.db.readyState !== 1) {
    res
      .status(503)
      .json({ message: "Database unavailable. Start MongoDB and retry." });
    return false;
  }

  return true;
};

const createToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    secret,
    { expiresIn: "7d" },
  );
};

router.post("/register", async (req, res) => {
  try {
    if (!ensureDbConnected(res)) {
      return;
    }

    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    const token = createToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!ensureDbConnected(res)) {
      return;
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = createToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  if (!ensureDbConnected(res)) {
    return;
  }

  const user = await User.findById(req.user.id).select("_id name email");

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

module.exports = router;
