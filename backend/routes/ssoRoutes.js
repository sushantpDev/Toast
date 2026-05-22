import express from 'express';
import { authorizeSSO, deductPoints } from '../controllers/ssoController.js';

const router = express.Router();

router.route('/authorize').get(authorizeSSO);
router.route('/api/sso/deduct-points').post(deductPoints);

export default router;
