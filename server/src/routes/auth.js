import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

// 🧩 Helper: create cookie
function setTokenCookie(res, userId, email) {
  const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // 🔒 Secure cookie setup
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production", // only send cookie via HTTPS in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

//
// ===============================
// 🔹 REGISTER
// ===============================
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Register request:", req.body);

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      console.log("⚠️ Missing fields");
      return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("⚠️ Email already exists:", email);
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    console.log("✅ User created:", user.email);
    setTokenCookie(res, user._id, user.email);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error("💥 Register route error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

//
// ===============================
// 🔹 LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Login request:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.log("⚠️ Missing email or password");
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log("❌ Wrong password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ Login success:", email);
    setTokenCookie(res, user._id, user.email);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error("💥 Login route error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

//
// ===============================
// 🔹 LOGOUT
// ===============================
router.post("/logout", (_req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    console.log("👋 User logged out");
    res.json({ ok: true });
  } catch (err) {
    console.error("💥 Logout route error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
