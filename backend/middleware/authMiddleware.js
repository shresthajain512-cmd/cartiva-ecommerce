const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 * Extracts Bearer token, verifies signature and expiration, and attaches the user document.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      if (!token || token.trim() === '') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, no token provided'
        });
      }

      // Verify JWT signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cartiva_dev_secret_key');

      // Fetch user from DB (excluding password) to guarantee live credentials and roles
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user belonging to this token no longer exists'
        });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token has expired'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, invalid token'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token verification failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

/**
 * Middleware to authorize specific user roles
 * Example usage: authorize('admin', 'seller')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

/**
 * Middleware for approved sellers only
 * Rejects non-sellers as well as pending or rejected sellers
 */
const approvedSellerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, user authentication required'
    });
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: `Access denied: Seller account required (current role: '${req.user.role}')`
    });
  }

  if (req.user.sellerApprovalStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: `Access denied: Seller account is currently ${req.user.sellerApprovalStatus || 'pending'} approval`
    });
  }

  next();
};

/**
 * Middleware to restrict access to Admin users only
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  approvedSellerOnly,
  adminOnly
};
