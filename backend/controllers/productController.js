const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

// Whitelisted allowed categories and sorting parameters
const ALLOWED_CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Fitness', 'Other'];
const ALLOWED_SORTS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  top_rated: { rating: -1, createdAt: -1 },
  popular: { reviewsCount: -1, stockCount: -1 },
  featured: { isFeatured: -1, createdAt: -1 }
};

// Helper: Safely escape user input for regular expression searches
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Get all public products with whitelisted search, category, seller, sort, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { keyword, category, seller, sort, inStock, minPrice, maxPrice, rating, featured, discounted, page = 1, limit = 20 } = req.query;

    const query = {
      isPublished: true,
      isArchived: false
    };

    // 1. Category validation & whitelisting
    if (category !== undefined) {
      if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}`
        });
      }
      query.category = category;
    }

    // 2. Keyword search: safely escaped regex to prevent ReDoS & NoSQL injection
    if (keyword !== undefined) {
      if (typeof keyword !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search keyword must be a string'
        });
      }
      const trimmed = keyword.trim().slice(0, 100);
      if (trimmed.length > 0) {
        const escaped = escapeRegex(trimmed);
        query.$or = [
          { title: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          { category: { $regex: escaped, $options: 'i' } },
          { storeName: { $regex: escaped, $options: 'i' } },
          { tags: { $regex: escaped, $options: 'i' } }
        ];
      }
    }

    // 3. Multi-Vendor Filter & Approval Verification:
    // Only products belonging to active, approved sellers are ever displayed to public customers
    if (seller !== undefined) {
      if (typeof seller !== 'string' || !mongoose.Types.ObjectId.isValid(seller)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid seller ID format'
        });
      }

      // Verify the targeted seller is actually approved
      const approvedSeller = await User.findOne({
        _id: seller,
        role: 'seller',
        sellerApprovalStatus: 'approved'
      });

      if (!approvedSeller) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalProducts: 0,
          totalPages: 0,
          currentPage: Number(page) || 1,
          products: []
        });
      }

      query.seller = approvedSeller._id;
    } else {
      // Find all currently approved seller IDs to guarantee no products from unapproved/suspended sellers leak
      const approvedSellerIds = await User.find({
        role: 'seller',
        sellerApprovalStatus: 'approved'
      }).distinct('_id');

      query.seller = { $in: approvedSellerIds };
    }

    // 4. Inventory filter
    if (inStock === 'true') {
      query.stockCount = { $gt: 0 };
    }

    // 4b. Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // 4c. Rating threshold filter
    if (rating !== undefined && !isNaN(Number(rating))) {
      query.rating = { $gte: Number(rating) };
    }

    // 4d. Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // 4e. Discounted filter
    if (discounted === 'true') {
      query.originalPrice = { $gt: 0 };
    }

    // 5. Sorting validation & whitelisting
    let sortOption = { createdAt: -1 }; // Default newest first
    if (sort !== undefined) {
      if (typeof sort !== 'string' || !ALLOWED_SORTS[sort]) {
        return res.status(400).json({
          success: false,
          message: `Invalid sort option. Allowed sorts are: ${Object.keys(ALLOWED_SORTS).join(', ')}`
        });
      }
      sortOption = ALLOWED_SORTS[sort];
    }

    // 6. Pagination validation
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page parameter must be a positive integer'
      });
    }

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit parameter must be an integer between 1 and 100'
      });
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parsedLimit)
        .populate('seller', 'name businessName')
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / parsedLimit) || 1,
      currentPage: parsedPage,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all allowable product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  res.status(200).json({
    success: true,
    categories: ALLOWED_CATEGORIES
  });
};

/**
 * @desc    Get products by specific storefront / approved seller
 * @route   GET /api/products/store/:sellerId
 * @access  Public
 */
const getProductsByStore = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store/seller ID format'
      });
    }

    const seller = await User.findOne({
      _id: sellerId,
      role: 'seller',
      sellerApprovalStatus: 'approved'
    }).select('name businessName');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Store not found or seller is not approved'
      });
    }

    const products = await Product.find({
      seller: seller._id,
      isPublished: true,
      isArchived: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      store: {
        id: seller._id,
        name: seller.name,
        businessName: seller.businessName
      },
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single product by ID (must belong to an approved seller)
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findOne({
      _id: id,
      isArchived: false,
      isPublished: true
    }).populate('seller', 'name businessName sellerApprovalStatus');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Public customers must never see products belonging to unapproved, pending, or suspended sellers
    if (!product.seller || product.seller.sellerApprovalStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Product not found or seller is not approved'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create a new product (Approved Sellers Only)
 * @route   POST /api/products
 * @access  Private (Approved Sellers Only)
 */
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, stockCount, isPublished } = req.body;

    // 1. Required fields presence check
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid product title'
      });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid product description'
      });
    }

    if (title.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 120 characters'
      });
    }

    if (description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 2000 characters'
      });
    }

    // 2. Strict Price validation
    if (
      price === undefined ||
      price === null ||
      typeof price !== 'number' ||
      isNaN(price) ||
      !isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number'
      });
    }

    // 3. Strict Stock Count validation (Non-negative integer)
    if (
      stockCount === undefined ||
      stockCount === null ||
      typeof stockCount !== 'number' ||
      isNaN(stockCount) ||
      !Number.isInteger(stockCount) ||
      stockCount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Stock count must be a non-negative integer'
      });
    }

    // 4. Category validation
    let assignedCategory = 'Other';
    if (category !== undefined) {
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}`
        });
      }
      assignedCategory = category;
    }

    // 5. Image URL
    const finalImageUrl =
      (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30';

    // 6. Security Rule: Derive seller identity strictly from the verified authenticated JWT.
    // Client-supplied seller or createdBy fields in req.body are strictly ignored.
    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price,
      category: assignedCategory,
      imageUrl: finalImageUrl,
      stockCount,
      seller: req.user._id,
      createdBy: req.user._id,
      storeName: req.user.businessName,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      isArchived: false
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all products owned by currently authenticated seller
 * @route   GET /api/products/seller/my-products
 * @access  Private (Approved Sellers Only)
 */
const getSellerProducts = async (req, res) => {
  try {
    const filter = {
      seller: req.user._id
    };

    if (req.query.includeArchived !== 'true') {
      filter.isArchived = false;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      storefront: req.user.businessName,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update an existing product (Seller must own the product, or user is Admin)
 * @route   PUT /api/products/:id
 * @access  Private (Approved Seller / Admin)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product || product.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Security Rule: Object-Level Authorization (Only product owner or admin can update)
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to modify products from another seller'
      });
    }

    // Field-by-field updates with strict whitelisting and validations
    const { title, description, price, category, imageUrl, stockCount, isPublished } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) {
        return res.status(400).json({
          success: false,
          message: 'Title must be a non-empty string under 120 characters'
        });
      }
      product.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim() || description.trim().length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Description must be a non-empty string under 2000 characters'
        });
      }
      product.description = description.trim();
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || isNaN(price) || !isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number'
        });
      }
      product.price = price;
    }

    if (stockCount !== undefined) {
      if (typeof stockCount !== 'number' || isNaN(stockCount) || !Number.isInteger(stockCount) || stockCount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock count must be a non-negative integer'
        });
      }
      product.stockCount = stockCount;
    }

    if (category !== undefined) {
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}`
        });
      }
      product.category = category;
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must be a valid string'
        });
      }
      product.imageUrl = imageUrl.trim();
    }

    if (isPublished !== undefined) {
      product.isPublished = Boolean(isPublished);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Soft-delete / Archive a product (Seller must own the product, or user is Admin)
 * @route   DELETE /api/products/:id
 * @access  Private (Approved Seller / Admin)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product || product.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Security Rule: Object-Level Authorization (Only product owner or admin can delete)
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to delete products from another seller'
      });
    }

    // Soft deletion: marks product as archived and unpublishes it to preserve order history integrity
    product.isArchived = true;
    product.isPublished = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductsByStore,
  getProductById,
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct
};
