import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

// 🧩 Helper: Set JWT cookie
function setTokenCookie(res, userId, email) {
  const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// 🔹 Middleware: Log incoming requests with origin info
router.use((req, _res, next) => {
  const origin = req.headers.origin || "unknown origin";
  console.log(`🌐 Request from: ${origin} → ${req.method} ${req.originalUrl}`);
  next();
});

//
// ===============================
// 🔹 REGISTER
// ===============================
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Register request body:", req.body);

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      console.warn("⚠️ Missing registration fields");
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.warn("⚠️ Email already in use:", email);
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    setTokenCookie(res, user._id, user.email);
    console.log("✅ Registration successful for:", user.email);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error("💥 Register error:", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

//
// ===============================
// 🔹 LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Login attempt:", req.body.email);

    const { email, password } = req.body;
    if (!email || !password) {
      console.warn("⚠️ Missing login fields");
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("❌ No user found for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.warn("❌ Wrong password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    setTokenCookie(res, user._id, user.email);
    console.log("✅ Login success for:", user.email);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error("💥 Login route error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

//
// ===============================
// 🔹 LOGOUT
// ===============================
router.post("/logout", (req, res) => {
  try {
    console.log("👋 Logout request from:", req.headers.origin || "unknown origin");
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("💥 Logout error:", err.message);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
