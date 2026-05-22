import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if any admin exists
    const adminExists = await Admin.findOne({ role: 'admin' });

    if (!adminExists) {
      const defaultAdmin = {
        name: 'Toast Admin',
        email: 'admin@toast.com',
        password: 'ToastAdminSecure2026!', // Will be hashed by pre-save hook
        role: 'admin',
      };

      await Admin.create(defaultAdmin);
      console.log('Default Admin Account Seeded Successfully!');
      console.log('Email: admin@toast.com');
      console.log('Password: ToastAdminSecure2026!');
    } else {
      console.log('Admin account already exists. Seeding skipped.');
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
