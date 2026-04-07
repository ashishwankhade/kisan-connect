import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

// Import Routes
import authRoutes      from './routes/authRoutes.js';
import landRoutes      from './routes/landRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import requestRoutes   from './routes/requestRoutes.js';
import cropRoutes      from './routes/cropRoutes.js';
import adminRoutes     from './routes/adminRoutes.js';

const app = express();

// 1. Connect to Database
connectDB();

// 2. Middleware

// FIX: CORS origin is now driven by an environment variable.
// In development it falls back to localhost:5173.
// In production, set CLIENT_URL=https://yourdomain.com in your .env
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Routes
app.use('/api/auth',      authRoutes);
app.use('/api/lands',     landRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests',  requestRoutes);
app.use('/api/crops',     cropRoutes);
app.use('/api/admin',     adminRoutes);

// 4. Default Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));