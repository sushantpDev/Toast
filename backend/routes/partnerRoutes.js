import express from 'express';
import {
  registerPartner,
  getPartners,
  getPartnerByClientId,
} from '../controllers/partnerController.js';

const router = express.Router();

router.route('/register').post(registerPartner);
router.route('/').get(getPartners);
router.route('/:clientId').get(getPartnerByClientId);

export default router;
