import mongoose from 'mongoose';

const rewardTransactionSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RewardTransaction = mongoose.model('RewardTransaction', rewardTransactionSchema);

export default RewardTransaction;
