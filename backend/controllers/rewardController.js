import RewardTransaction from '../models/RewardTransaction.js';
import Employee from '../models/Employee.js';

// @desc    Assign reward points to a single employee
// @route   POST /api/rewards/assign
// @access  Private (Admin only)
export const assignReward = async (req, res) => {
  const { employeeId, points, category, reason } = req.body;

  if (!employeeId || !points || !category || !reason) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (points <= 0) {
    return res.status(400).json({ message: 'Points must be greater than zero' });
  }

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Create transaction
    const transaction = await RewardTransaction.create({
      employeeId,
      points,
      type: 'credit',
      category,
      reason,
      assignedBy: req.user._id, // Set by protect middleware
    });

    // Update employee total points
    employee.totalPoints += Number(points);
    await employee.save();

    res.status(201).json({
      message: 'Reward assigned successfully',
      transaction,
      newTotalPoints: employee.totalPoints,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error assigning reward' });
  }
};

// @desc    Bulk assign reward points to all active employees
// @route   POST /api/rewards/bulk-assign
// @access  Private (Admin only)
export const bulkAssignReward = async (req, res) => {
  const { points, category, reason } = req.body;

  if (!points || !category || !reason) {
    return res.status(400).json({ message: 'Please provide points, category, and reason' });
  }

  try {
    const activeEmployees = await Employee.find({ isActive: true });
    
    if (activeEmployees.length === 0) {
      return res.status(404).json({ message: 'No active employees found' });
    }

    const transactions = [];

    // Process all assignments
    for (const employee of activeEmployees) {
      employee.totalPoints += Number(points);
      await employee.save();

      transactions.push({
        employeeId: employee._id,
        points,
        type: 'credit',
        category,
        reason,
        assignedBy: req.user._id,
      });
    }

    // Insert all transactions at once
    await RewardTransaction.insertMany(transactions);

    res.status(201).json({
      message: `Successfully assigned ${points} points to ${activeEmployees.length} employees`,
      count: activeEmployees.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error bulk assigning rewards' });
  }
};

// @desc    Get reward transactions (all for Admin, own for Employee)
// @route   GET /api/rewards/history
// @access  Private
export const getRewardHistory = async (req, res) => {
  try {
    let query = {};
    
    // If it's an employee, only show their own history
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.query.employeeId) {
      // If admin wants a specific employee's history
      query.employeeId = req.query.employeeId;
    }

    const transactions = await RewardTransaction.find(query)
      .populate('employeeId', 'name email department')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching reward history' });
  }
};

// @desc    Get reward analytics
// @route   GET /api/rewards/analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res) => {
  try {
    // Total employees
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isActive: true });

    // Total points distributed
    const result = await RewardTransaction.aggregate([
      { $match: { type: 'credit' } },
      { $group: { _id: null, totalPoints: { $sum: '$points' } } }
    ]);
    const totalPointsDistributed = result.length > 0 ? result[0].totalPoints : 0;

    // Top rewarded employees
    const topEmployees = await Employee.find()
      .sort({ totalPoints: -1 })
      .limit(5)
      .select('name department totalPoints');

    // Recent rewards
    const recentRewards = await RewardTransaction.find()
      .populate('employeeId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Points by category
    const categoryDistribution = await RewardTransaction.aggregate([
      { $match: { type: 'credit' } },
      { $group: { _id: '$category', points: { $sum: '$points' } } },
      { $sort: { points: -1 } }
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      totalPointsDistributed,
      topEmployees,
      recentRewards,
      categoryDistribution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};
