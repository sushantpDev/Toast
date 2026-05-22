import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PartnerApplication from './models/partnerApplicationModel.js';
import connectDB from './config/db.js';

dotenv.config();

const queryPartners = async () => {
  try {
    await connectDB();
    const partners = await PartnerApplication.find({});
    console.log('Partners in database:', JSON.stringify(partners, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

queryPartners();
