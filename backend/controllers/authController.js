const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate a signed JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT configuration error: JWT_SECRET environment variable is missing');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Email validation regex (standard RFC 5322 compatible subset)
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * @desc    Register a new user (Customer or Seller)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, businessName } = req.body;

    // 1. Validate required basic fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a password'
      });
    }

    // 2. Validate email format
    const normalizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // 3. Validate password strength/length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 4. Role validation & Admin Registration Protection
    let targetRole = 'customer';
    if (role !== undefined && role !== null) {
      const sanitizedRole = String(role).toLowerCase().trim();

      // SECURITY RULE: Strictly disallow public registration with 'admin' role
      if (sanitizedRole === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Admin registration is not permitted via public registration'
        });
      }

      if (!['customer', 'seller'].includes(sanitizedRole)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified. Allowed roles are: customer, seller'
        });
      }

      targetRole = sanitizedRole;
    }

    // 5. Seller-specific validation
    if (targetRole === 'seller') {
      if (!businessName || typeof businessName !== 'string' || !businessName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Business name is required for seller registration'
        });
      }
    }

    // 6. Check for duplicate email (case-insensitive)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // 7. Assemble user document payload
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password, // Will be securely hashed by User model pre-save hook
      role: targetRole
    };

    if (targetRole === 'seller') {
      userData.businessName = businessName.trim();
      userData.sellerApprovalStatus = 'pending';
    }

    // 8. Create user in database
    const user = await User.create(userData);

    // 9. Format response (Password hash is strictly excluded)
    const responsePayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    if (user.role === 'seller') {
      responsePayload.businessName = user.businessName;
      responsePayload.sellerApprovalStatus = user.sellerApprovalStatus;
    }

    res.status(201).json({
      success: true,
      message: targetRole === 'seller'
        ? 'Seller account registered successfully and is pending approval'
        : 'Customer registered successfully',
      token: generateToken(user._id),
      user: responsePayload
    });
  } catch (error) {
    // Handle Mongoose duplicate key error (code 11000) gracefully if race condition occurs
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Find user by normalized email and explicitly include password field for comparison
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Generic error for invalid credentials prevents account enumeration attacks
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const responsePayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    if (user.role === 'seller') {
      responsePayload.businessName = user.businessName;
      responsePayload.sellerApprovalStatus = user.sellerApprovalStatus;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: responsePayload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private (Logged-in User)
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const responsePayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'seller') {
      responsePayload.businessName = user.businessName;
      responsePayload.sellerApprovalStatus = user.sellerApprovalStatus;
    }

    res.status(200).json({
      success: true,
      user: responsePayload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
