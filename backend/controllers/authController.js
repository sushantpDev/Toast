import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token (Admin or Employee)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // 1. Try to find admin
    let user = await Admin.findOne({ email });
    let isEmployee = false;

    if (!user) {
      // 2. Try to find employee
      user = await Employee.findOne({ email });
      isEmployee = true;
    }

    // 3. User not found
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4. If employee, check if active
    if (isEmployee && !user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact your administrator.' });
    }

    // 5. Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 6. Successful login
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isFirstLogin: isEmployee ? user.isFirstLogin : false,
      department: isEmployee ? user.department : undefined,
      totalPoints: isEmployee ? user.totalPoints : undefined,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Force password change on first login
// @route   POST /api/auth/force-password-change
// @access  Private (Employee only, isFirstLogin must be true)
const forcePasswordChange = async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'Please provide a new password' });
  }

  try {
    // req.user is set by protect middleware
    const employee = await Employee.findById(req.user._id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!employee.isFirstLogin) {
      return res.status(400).json({ message: 'Password has already been changed' });
    }

    // Update password (pre-save middleware will hash it)
    employee.password = newPassword;
    employee.isFirstLogin = false;
    await employee.save();

    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      isFirstLogin: employee.isFirstLogin,
      department: employee.department,
      totalPoints: employee.totalPoints,
      token: generateToken(employee._id, employee.role),
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during password update' });
  }
};

// @desc    Change password (standard)
// @route   POST /api/auth/change-password
// @access  Private (Admin or Employee)
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide old and new passwords' });
  }

  try {
    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user._id);
    } else {
      user = await Employee.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user._id).select('-password');
    } else {
      user = await Employee.findById(req.user._id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

export { loginUser, forcePasswordChange, changePassword, getMe };
