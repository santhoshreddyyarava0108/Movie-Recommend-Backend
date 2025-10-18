// routes/me.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    // req.user.id comes from JWT (decoded in requireAuth)
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
