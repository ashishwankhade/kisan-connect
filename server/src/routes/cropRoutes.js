import express from 'express';
import { registerCrop, getMyCrops, getAllCrops } from '../controllers/cropController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Configure Multer to accept specific file fields
const multipleUploads = upload.fields([
  { name: 'cropImage', maxCount: 1 },
  { name: 'landDocument', maxCount: 1 }
]);

// 🔥 FIX: Wrapper to catch Multer/Cloudinary crashes cleanly
const uploadMiddleware = (req, res, next) => {
    multipleUploads(req, res, (err) => {
        if (err) {
            console.error("Multer/Cloudinary Error:", err);
            return res.status(400).json({ 
                message: "File upload failed. Please ensure files are Images or PDFs.", 
                error: err.message 
            });
        }
        next();
    });
};

// Public/Admin Route: Get all crops
// Private Route: Register a crop (with safe upload middleware)
router.route('/')
  .get(getAllCrops)
  .post(protect, uploadMiddleware, registerCrop); // Used the wrapper here

// Private Route: Get logged-in farmer's crops
router.get('/mycrops', protect, getMyCrops);

export default router;