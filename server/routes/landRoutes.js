import express from 'express';
import { 
  getAllLands, 
  createLand, 
  getMyLands, 
  updateLand, 
  deleteLand 
} from '../controllers/landController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js'; 

const router = express.Router();

// 1. Public Route: Get all listings (Marketplace)
router.get('/', getAllLands);

// 2. Protected Route: Create a listing
router.post('/', protect, upload.single('image'), createLand);

// 3. Protected Route: Get ONLY logged-in user's listings
// 🔥 CRITICAL: This must be defined BEFORE the /:id routes
router.get('/user', protect, getMyLands); 

// 4. Dynamic Routes (Update & Delete by ID)
// 🔥 UPDATE: Added upload.single('image') to handle image updates
router.put('/:id', protect, upload.single('image'), updateLand);

router.delete('/:id', protect, deleteLand);

export default router;