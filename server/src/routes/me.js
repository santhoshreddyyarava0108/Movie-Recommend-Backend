// routes/me.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      favorites: user.favorites || [],
      mood: user.mood || "neutral",
    });
  } catch (err) {
    console.error("💥 /api/me error:", err.message);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

export default router;
