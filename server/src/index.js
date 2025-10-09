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

// ✅ CORS configuration (includes preflight support)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176", // local dev ports
  "https://movie-recommend-frontend.onrender.com", // production
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Handle preflight (OPTIONS) requests globally
app.options("*", cors());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch((err) => {
    console.error("❌ Mongo error", err);
    process.exit(1);
  });

// ✅ Health check route
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ✅ Wire routes
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);

// ✅ Server start
const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`🚀 API running at http://localhost:${port}`)
);
