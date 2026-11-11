const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Helper to escape regex search query safely
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Get aggregated platform metrics for admin dashboard
 * @route   GET /api/admin/metrics
 * @access  Private (Admin only)
 */
const getAdminMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalSellers,
      totalAdmins,
      pendingSellers,
      approvedSellers,
      rejectedSellers,
      suspendedSellers,
      activeUsers,
      suspendedUsers,
      totalProducts,
      activeProducts,
      archivedProducts,
      totalOrders,
      placedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      recentOrders,
      recentSellers
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'seller', sellerApprovalStatus: 'pending' }),
      User.countDocuments({ role: 'seller', sellerApprovalStatus: 'approved' }),
      User.countDocuments({ role: 'seller', sellerApprovalStatus: 'rejected' }),
      User.countDocuments({ role: 'seller', sellerApprovalStatus: 'suspended' }),
      User.countDocuments({ accountStatus: 'active' }),
      User.countDocuments({ accountStatus: 'suspended' }),
      Product.countDocuments({}),
      Product.countDocuments({ isArchived: false, isPublished: true }),
      Product.countDocuments({ isArchived: true }),
      Order.countDocuments({}),
      Order.countDocuments({ orderStatus: 'Placed' }),
      Order.countDocuments({ orderStatus: 'Processing' }),
      Order.countDocuments({ orderStatus: 'Shipped' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .select('orderReference customerInfo totalAmount orderStatus itemsSubtotal shippingFee createdAt paymentResult')
        .populate('user', 'name email'),
      User.find({ role: 'seller' })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name email businessName sellerApprovalStatus createdAt')
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          sellers: totalSellers,
          admins: totalAdmins,
          active: activeUsers,
          suspended: suspendedUsers
        },
        sellers: {
          total: totalSellers,
          pending: pendingSellers,
          approved: approvedSellers,
          rejected: rejectedSellers,
          suspended: suspendedSellers
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          archived: archivedProducts
        },
        orders: {
          total: totalOrders,
          placed: placedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          totalRevenue
        },
        recentOrders,
        recentSellers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin metrics'
    });
  }
};

/**
 * @desc    Get all seller applications with status filtering and search
 * @route   GET /api/admin/sellers
 * @access  Private (Admin only)
 */
const getAdminSellers = async (req, res) => {
  try {
    const { status, q } = req.query;

    const query = { role: 'seller' };

    if (status && status !== 'all') {
      const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
      if (validStatuses.includes(status)) {
        query.sellerApprovalStatus = status;
      }
    }

    if (q && typeof q === 'string' && q.trim()) {
      const escaped = escapeRegex(q.trim());
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { businessName: { $regex: escaped, $options: 'i' } }
      ];
    }

    const sellers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sellers'
    });
  }
};

/**
 * @desc    Update seller approval status (Approve, Reject, Suspend, Pending)
 * @route   PUT /api/admin/sellers/:id/approval
 * @access  Private (Admin only)
 */
const updateSellerApproval = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Permitted values: ${validStatuses.join(', ')}`
      });
    }

    const seller = await User.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({
        success: false,
        message: 'Specified user is not a seller'
      });
    }

    seller.sellerApprovalStatus = status;
    await seller.save();

    const safeSeller = await User.findById(seller._id).select('-password');

    res.status(200).json({
      success: true,
      message: `Seller status successfully updated to "${status}"`,
      seller: safeSeller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating seller approval status'
    });
  }
};

/**
 * @desc    Get users list with role filter, status filter, search, and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAdminUsers = async (req, res) => {
  try {
    const { role, status, q, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role && role !== 'all') {
      const validRoles = ['customer', 'seller', 'admin'];
      if (validRoles.includes(role)) {
        query.role = role;
      }
    }

    if (status && status !== 'all') {
      const validStatuses = ['active', 'suspended'];
      if (validStatuses.includes(status)) {
        query.accountStatus = status;
      }
    }

    if (q && typeof q === 'string' && q.trim()) {
      const escaped = escapeRegex(q.trim());
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { businessName: { $regex: escaped, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum) || 1,
      currentPage: pageNum,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
};

/**
 * @desc    Update user account standing (active or suspended)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { accountStatus } = req.body;
    const validStatuses = ['active', 'suspended'];

    if (!accountStatus || !validStatuses.includes(accountStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Permitted values: ${validStatuses.join(', ')}`
      });
    }

    // Safety guard: Admin cannot suspend their own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.accountStatus = accountStatus;
    await user.save();

    const safeUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: `User account standing updated to "${accountStatus}"`,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user status'
    });
  }
};

/**
 * @desc    Get all marketplace products for admin moderation (including archived)
 * @route   GET /api/admin/products
 * @access  Private (Admin only)
 */
const getAdminProducts = async (req, res) => {
  try {
    const { category, keyword, status, seller, page = 1, limit = 20 } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status === 'active') {
      query.isArchived = false;
      query.isPublished = true;
    } else if (status === 'archived') {
      query.isArchived = true;
    }

    if (seller && mongoose.Types.ObjectId.isValid(seller)) {
      query.seller = seller;
    }

    if (keyword && typeof keyword === 'string' && keyword.trim()) {
      const escaped = escapeRegex(keyword.trim());
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { storeName: { $regex: escaped, $options: 'i' } },
        { category: { $regex: escaped, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .populate('seller', 'name email businessName sellerApprovalStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      total: totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum) || 1,
      currentPage: pageNum,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

/**
 * @desc    Moderate a product (toggle archive, publication, or featured status)
 * @route   PUT /api/admin/products/:id/moderate
 * @access  Private (Admin only)
 */
const moderateProduct = async (req, res) => {
  try {
    const { isArchived, isPublished, isFeatured } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (typeof isArchived === 'boolean') {
      product.isArchived = isArchived;
      if (isArchived) {
        product.isPublished = false;
      }
    }

    if (typeof isPublished === 'boolean' && !product.isArchived) {
      product.isPublished = isPublished;
    }

    if (typeof isFeatured === 'boolean') {
      product.isFeatured = isFeatured;
    }

    await product.save();

    const populated = await Product.findById(product._id).populate(
      'seller',
      'name email businessName'
    );

    res.status(200).json({
      success: true,
      message: 'Product moderation status updated successfully',
      product: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error moderating product'
    });
  }
};

module.exports = {
  getAdminMetrics,
  getAdminSellers,
  updateSellerApproval,
  getAdminUsers,
  updateUserStatus,
  getAdminProducts,
  moderateProduct
};

