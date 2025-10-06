import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// Helper: set cookie
function setTokenCookie(res, userId, email) {
  const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // change to true in production (HTTPS)
    maxAge: 7 * 24 * 3600 * 1000 // 7 days
  });
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  setTokenCookie(res, user._id, user.email);
  res.json({ id: user._id, name: user.name, email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  setTokenCookie(res, user._id, user.email);
  res.json({ id: user._id, name: user.name, email: user.email });
});

router.post('/logout', (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
