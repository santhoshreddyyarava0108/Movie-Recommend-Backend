import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  res.json({ id: user._id, name: user.name, email: user.email, favorites: user.favorites, mood: user.mood });
});

export default router;
