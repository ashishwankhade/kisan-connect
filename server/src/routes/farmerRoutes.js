import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add-land', protect, restrictTo('farmer'), (req, res) => {
  res.json({ message: "Land listing created by Farmer" });
});

router.post('/register-crop', protect, restrictTo('farmer'), (req, res) => {
  res.json({ message: "Crop registered successfully" });
});

export default router;