import express from 'express';
import {
  loginUser,
  forcePasswordChange,
  changePassword,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/force-password-change', protect, forcePasswordChange);
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

export default router;
