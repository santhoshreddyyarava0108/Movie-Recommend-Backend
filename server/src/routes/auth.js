import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

// 🧩 Helper: create secure cookie
function setTokenCookie(res, userId, email) {
  const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // Always HTTPS on Render
    sameSite: "none", // Required for cross-site cookies (Render <-> Vercel)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// ===============================
// 🔹 REGISTER
// ===============================
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Register request:", req.body);

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    console.log("✅ Registered user:", user.email);
    setTokenCookie(res, user._id, user.email);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error("💥 Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ===============================
// 🔹 LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Login request:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ Login success:", email);
    setTokenCookie(res, user._id, user.email);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error("💥 Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ===============================
// 🔹 LOGOUT
// ===============================
router.post("/logout", (_req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    console.log("👋 User logged out");
    res.json({ ok: true });
  } catch (err) {
    console.error("💥 Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
