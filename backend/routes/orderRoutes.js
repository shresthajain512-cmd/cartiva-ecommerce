const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const {
  protect,
  approvedSellerOnly,
  approvedSellerOrAdmin,
  adminOnly
} = require('../middleware/authMiddleware');

// Customer & General Authenticated Order Routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

// Seller-specific Order Isolation Route
router.get('/seller/my-orders', protect, approvedSellerOnly, getSellerOrders);

// Single Order Lookup (Authenticated Customer Owner, Participating Seller, or Admin)
router.get('/:id', protect, getOrderById);

// Admin-only Platform Orders Route
router.get('/', protect, adminOnly, getAllOrders);

// Order Status Update (Admin or Participating Seller for their sub-order)
router.put('/:id/status', protect, approvedSellerOrAdmin, updateOrderStatus);

module.exports = router;