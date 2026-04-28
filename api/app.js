import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.router.js';
import uploadRoutes from './routes/upload.js';
import listingRouter from './routes/listing.route.js';
import chatRouter from './routes/chat.route.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // allow Vite/React inline styles in dev
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting — auth endpoints only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/auth', authLimiter);

// ── Body / Cookie parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRoutes);
app.use('/api/listing', listingRouter);
app.use('/api/chat', chatRouter);

// ── Serve React build in production ───────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// ── Global error handler ───────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, statusCode, message });
});

export default app;
