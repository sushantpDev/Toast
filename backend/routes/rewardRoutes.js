import express from 'express';
import {
  assignReward,
  bulkAssignReward,
  getRewardHistory,
  getAnalytics
} from '../controllers/rewardController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all reward routes
router.use(protect);

// Employee & Admin can view history
router.get('/history', getRewardHistory);

// Admin-only routes
router.post('/assign', adminOnly, assignReward);
router.post('/bulk-assign', adminOnly, bulkAssignReward);
router.get('/analytics', adminOnly, getAnalytics);

export default router;
