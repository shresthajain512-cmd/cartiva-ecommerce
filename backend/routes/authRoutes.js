const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile
} = require('../controllers/authController');
const {
  protect,
  approvedSellerOnly,
  adminOnly
} = require('../middleware/authMiddleware');

// 1. Public Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// 2. Protected User Profile (Any Authenticated Role)
router.get('/profile', protect, getUserProfile);

// 3. Protected Seller Portal (Approved Sellers Only)
router.get('/seller/dashboard', protect, approvedSellerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the approved seller portal',
    seller: {
      id: req.user._id,
      name: req.user.name,
      businessName: req.user.businessName,
      status: req.user.sellerApprovalStatus
    }
  });
});

// 4. Protected Seller Product Management Route (Approved Sellers Only)
router.get('/seller/products', protect, approvedSellerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Seller product management portal accessible',
    storefront: req.user.businessName
  });
});

// 4. Protected Admin Portal (Admin Only)
router.get('/admin/dashboard', protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the admin control center',
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
