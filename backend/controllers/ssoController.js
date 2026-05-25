import jwt from 'jsonwebtoken';
import PartnerApplication from '../models/partnerApplicationModel.js';
import Employee from '../models/Employee.js';
import RewardTransaction from '../models/RewardTransaction.js';

// @desc    Authorize SSO request and redirect with token
// @route   GET /authorize
// @access  Public (handles its own auth check/redirect)
export const authorizeSSO = async (req, res) => {
  try {
    const { client_id, redirect_uri, token, email } = req.query;

    if (!client_id || !redirect_uri) {
      return res.status(400).json({ message: 'client_id and redirect_uri are required' });
    }

    // 1. Validate Partner Application
    const partner = await PartnerApplication.findOne({ clientId: client_id });

    if (!partner) {
      return res.status(400).json({ message: 'Invalid partner application' });
    }

    if (!partner.isActive) {
      return res.status(400).json({ message: 'Partner application is inactive' });
    }

    // Support both new allowedRedirectUris array and legacy redirectUri string
    const allowedUris = partner.allowedRedirectUris?.length
      ? partner.allowedRedirectUris
      : [partner.redirectUri];

    if (!allowedUris.includes(redirect_uri)) {
      return res.status(400).json({ message: 'redirect_uri mismatch' });
    }

    // 2. Verify employee authentication
    // Try to get token from query (if redirected from frontend) or authorization header
    let authToken = token;
    if (!authToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      authToken = req.headers.authorization.split(' ')[1];
    }

    let toastLoginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    if (email) {
      toastLoginUrl += `&email=${encodeURIComponent(email)}`;
    }

    if (!authToken) {
      // If employee is NOT logged in: redirect employee to Toast login page
      return res.redirect(toastLoginUrl);
    }

    let decoded;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'toast_secret_key_2026');
    } catch (err) {
      // Invalid or expired token: redirect to Toast login page
      return res.redirect(toastLoginUrl);
    }

    // Get employee details
    const employee = await Employee.findById(decoded.id || decoded._id);
    
    if (!employee) {
      return res.status(401).json({ message: 'Employee not found' });
    }

    if (!employee.isActive) {
      return res.status(401).json({ message: 'Employee account is deactivated' });
    }

    // Check for session email mismatch
    if (email && employee.email.toLowerCase() !== email.toLowerCase()) {
      console.log(`SSO Session mismatch. Token is for ${employee.email}, but requested login for ${email}. Redirecting to login.`);
      return res.redirect(toastLoginUrl);
    }

    // 3. Generate SSO JWT Token
    const ssoPayload = {
      employeeId: employee._id,
      name: employee.name,
      email: employee.email,
      rewardPoints: employee.totalPoints || 0,
    };

    const ssoToken = jwt.sign(ssoPayload, process.env.JWT_SECRET || 'toast_secret_key_2026', {
      expiresIn: '1h',
    });

    // 4. Redirect back to ShelfMerch
    const finalRedirectUrl = `${redirect_uri}?token=${ssoToken}`;
    return res.redirect(finalRedirectUrl);

  } catch (error) {
    console.error('SSO Authorization Error:', error);
    res.status(500).json({ message: 'Internal Server Error during SSO authorization' });
  }
};

// @desc    Deduct points from employee balance (called by partner applications)
// @route   POST /api/sso/deduct-points
// @access  Public (validated via SSO bearer token)
export const deductPoints = async (req, res) => {
  try {
    const { points, description } = req.body;
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token is required' });
    }

    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Valid points value greater than 0 is required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'toast_secret_key_2026');
    } catch (err) {
      return res.status(401).json({ message: 'Token verification failed' });
    }

    const employeeId = decoded.employeeId || decoded.id || decoded._id;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.totalPoints < points) {
      return res.status(400).json({ message: 'Insufficient points balance' });
    }

    // Deduct points
    employee.totalPoints -= Number(points);
    await employee.save();

    // Create transaction record
    await RewardTransaction.create({
      employeeId: employee._id,
      points: Number(points),
      type: 'debit',
      category: 'SSO Redemption',
      reason: description || 'Redeemed points at partner e-commerce store',
    });

    return res.status(200).json({
      message: 'Points deducted successfully',
      newBalance: employee.totalPoints,
    });

  } catch (error) {
    console.error('Error during points deduction:', error);
    res.status(500).json({ message: 'Internal Server Error during points deduction' });
  }
};
