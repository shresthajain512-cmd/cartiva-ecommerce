const express = require('express');
const router = express.Router();
const {
  getAdminMetrics,
  getAdminSellers,
  updateSellerApproval,
  getAdminUsers,
  updateUserStatus,
  getAdminProducts,
  moderateProduct
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Enforce authentication and administrative authorization on all admin endpoints
router.use(protect, adminOnly);

// 1. Platform Metrics & Analytics
router.get('/metrics', getAdminMetrics);

// 2. Seller Application Review & Storefront Approval
router.get('/sellers', getAdminSellers);
router.put('/sellers/:id/approval', updateSellerApproval);

// 3. User Directory & Account Suspension
router.get('/users', getAdminUsers);
router.put('/users/:id/status', updateUserStatus);

// 4. Product Catalog Moderation
router.get('/products', getAdminProducts);
router.put('/products/:id/moderate', moderateProduct);

module.exports = router;

