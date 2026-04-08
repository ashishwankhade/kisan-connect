import express from 'express';
import { 
    getDashboardStats, 
    verifyCrop,
    getProcurementList,     // 🔥 Added
    getAllFarmers,          // 🔥 Added
    getMarketplaceData,     // 🔥 Added
    deleteMarketplaceItem   // 🔥 Added
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PHASE 1 ROUTES ---
// Get overall stats for dashboard
router.get('/stats', protect, getDashboardStats);

// Update crop verification status (Approve/Reject)
router.put('/crops/:id/verify', protect, verifyCrop);


// --- PHASE 2 ROUTES ---
// Get list of crops meant for Govt Mandi
router.get('/procurement', protect, getProcurementList);

// Get directory of all registered farmers
router.get('/farmers', protect, getAllFarmers);

// Get all marketplace items (Lands & Equipment)
router.get('/marketplace', protect, getMarketplaceData);

// Delete a specific marketplace item
router.delete('/marketplace/:type/:id', protect, deleteMarketplaceItem);

export default router;