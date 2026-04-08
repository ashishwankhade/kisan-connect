import express from 'express';
import { 
  getEquipment, 
  createEquipment, 
  getMyEquipment, 
  updateEquipment, 
  deleteEquipment 
} from '../controllers/equipmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Public: Get all listings
// Private: Create new listing (handles image upload)
router.route('/')
  .get(getEquipment)
  .post(protect, upload.single('image'), createEquipment);

// Private: Get logged-in user's specific listings
// 🔥 This must stay above the /:id route
router.get('/user', protect, getMyEquipment);

// Private: Update or Delete a specific listing
router.route('/:id')
  .put(protect, upload.single('image'), updateEquipment)
  .delete(protect, deleteEquipment);

export default router;