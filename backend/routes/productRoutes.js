const express = require('express');
const router = express.Router();
const {
  getProducts,
  getCategories,
  getProductsByStore,
  getProductById,
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const {
  protect,
  approvedSellerOnly,
  approvedSellerOrAdmin
} = require('../middleware/authMiddleware');

// 1. Public Catalogue & Discovery Routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/store/:sellerId', getProductsByStore);

// 2. Seller-Protected Routes (Must precede dynamic /:id parameter)
router.get('/seller/my-products', protect, approvedSellerOnly, getSellerProducts);
router.post('/', protect, approvedSellerOnly, createProduct);

// 3. Seller or Admin Operations (with ownership verification)
router.put('/:id', protect, approvedSellerOrAdmin, updateProduct);
router.delete('/:id', protect, approvedSellerOrAdmin, deleteProduct);

// 4. Public Single Product Details Route (Placed last to prevent param collision)
router.get('/:id', getProductById);

module.exports = router;
