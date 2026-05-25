import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import ssoRoutes from './routes/ssoRoutes.js';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,           // e.g. https://changebag.org (prod toast frontend)
  'https://tollywoodreels.com',     // pshelfmerch production
  'https://www.tollywoodreels.com',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    // Allow any localhost origin in development
    if (
      process.env.NODE_ENV !== 'production' &&
      (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
    ) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/', ssoRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Toast Identity Provider API is running...');
});

// Error handling middleware (catch-all)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
