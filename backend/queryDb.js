import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

dotenv.config();

const queryDb = async () => {
  try {
    await connectDB();
    const employees = await Employee.find({});
    console.log('Employees:', JSON.stringify(employees, null, 2));

    const admins = await Admin.find({});
    console.log('Admins:', JSON.stringify(admins, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

queryDb();
