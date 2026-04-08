import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import Routes
import authRoutes      from './routes/authRoutes.js';
import landRoutes      from './routes/landRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import requestRoutes   from './routes/requestRoutes.js';
import cropRoutes      from './routes/cropRoutes.js';
import adminRoutes     from './routes/adminRoutes.js';

const app = express();

// 1. Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. API Routes
app.use('/api/auth',      authRoutes);
app.use('/api/lands',     landRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests',  requestRoutes);
app.use('/api/crops',     cropRoutes);
app.use('/api/admin',     adminRoutes);

// 3. Debug Route
app.get('/api/debug', (req, res) => {
  res.json({
    cookies:   req.cookies,
    origin:    req.headers.origin,
    nodeEnv:   process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
  });
});

// 4. Root Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;