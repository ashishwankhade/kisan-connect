import 'dotenv/config'; // Loads .env file
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // 🔥 NEW: Import cookie-parser
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import landRoutes from './routes/landRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import requestRoutes from './routes/requestRoutes.js'; 
import cropRoutes from './routes/cropRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

const app = express();

// 1. Connect to Database
connectDB();

// 2. Middleware
// 🔥 CRITICAL UPDATE: Configure CORS to accept cookies
app.use(cors({
  origin: 'http://localhost:5173', // Must match your React frontend URL exactly
  credentials: true, // Required to allow cookies to be sent and received
}));

app.use(express.json()); // Parses incoming JSON
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data (good for forms)
app.use(cookieParser()); // 🔥 NEW: Tells Express how to read cookies from requests

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/lands', landRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/crops', cropRoutes); 
app.use('/api/admin', adminRoutes);
// 4. Default Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));