// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.warn("⚠️ No token found in cookies");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      console.warn("⚠️ Token valid but user not found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("💥 Auth middleware error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
