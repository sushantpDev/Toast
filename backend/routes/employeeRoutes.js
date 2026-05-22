import express from 'express';
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  toggleEmployeeStatus,
  resetEmployeePassword,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply protect and adminOnly to all routes in this router
router.use(protect, adminOnly);

router.route('/')
  .post(createEmployee)
  .get(getEmployees);

router.route('/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

router.patch('/:id/toggle-status', toggleEmployeeStatus);
router.post('/:id/reset-password', resetEmployeePassword);

export default router;
