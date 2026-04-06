import express from 'express';
import {
  createRequest,
  getIncomingRequests,
  getOutgoingRequests,   // ← NEW: import this
  updateRequestStatus,
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/incoming', protect, getIncomingRequests);
router.get('/outgoing', protect, getOutgoingRequests);     // ← NEW route
router.put('/:id/status', protect, updateRequestStatus);

export default router;