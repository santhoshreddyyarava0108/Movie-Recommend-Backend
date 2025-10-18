import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ✅ Allowed origins (includes regex for Vercel)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "https://movie-recommend-frontend.onrender.com",
  "https://movie-recommend-frontend-phi.vercel.app",
];

// ✅ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) // ✅ allow all vercel.app domains
      ) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked CORS origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Handle preflight requests globally
app.options("*", cors());

// ✅ Explicitly set headers (for stricter browsers)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    allowedOrigins.includes(origin) ||
    (origin && /\.vercel\.app$/.test(origin))
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch((err) => {
    console.error("❌ Mongo error:", err);
    process.exit(1);
  });

// ✅ Health check route
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ✅ Main routes
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);

// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 API running and listening on port ${port}`);
});
