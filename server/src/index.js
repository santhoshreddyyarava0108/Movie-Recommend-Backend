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
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Mongo connected'))
  .catch(err => { console.error('❌ Mongo error', err); process.exit(1); });

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// 🔗 Wire routes
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 API running at http://localhost:${port}`));
