const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Indian Pincode / Postal Code Regex: 4 to 10 alphanumeric characters
const POSTAL_REGEX = /^[A-Za-z0-9\s-]{4,10}$/;
// Phone Number Regex: 10 to 20 numeric characters with optional leading +, dashes, or spaces
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{9,16}$/;

/**
 * Generate a collision-resistant human-readable order reference
 * Format: CTV-YYMM-XXXXXX
 */
const generateOrderReference = () => {
  const date = new Date();
  const yearSuffix = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const randomSix = Math.floor(100000 + Math.random() * 900000);
  return `CTV-${yearSuffix}${month}-${randomSix}`;
};

/**
 * @desc    Create new multi-vendor order with server-side inventory verification and price recalculation
 * @route   POST /api/orders
 * @access  Private (Authenticated User)
 */
const createOrder = async (req, res) => {
  // Array to track decremented items in case a mid-transaction rollback is needed
  const decrementedItems = [];

  try {
    const rawItems = req.body.items || req.body.orderItems;
    const { shippingAddress, paymentMethod } = req.body;

    // 1. Validate items presence and structure
    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided. Your shopping bag is empty.'
      });
    }

    // 2. Validate shipping address presence and fields
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid shipping address'
      });
    }

    const {
      fullName = '',
      phone = '',
      street = '',
      city = '',
      state = '',
      postalCode = '',
      country = 'India'
    } = shippingAddress;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full recipient name is required for shipping'
      });
    }

    if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contact phone number (at least 10 digits)'
      });
    }

    if (!street || typeof street !== 'string' || !street.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Street delivery address is required'
      });
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City is required for delivery'
      });
    }

    if (!state || typeof state !== 'string' || !state.trim()) {
      return res.status(400).json({
        success: false,
        message: 'State or region is required for delivery'
      });
    }

    if (!postalCode || typeof postalCode !== 'string' || !POSTAL_REGEX.test(postalCode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid postal code / pincode'
      });
    }

    // 3. Normalize and validate requested item quantities & product IDs
    const sanitizedItems = [];
    for (const rawItem of rawItems) {
      const productId = rawItem.productId || rawItem.product?._id || rawItem.product;
      const quantity = Number(rawItem.quantity);

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product identifier: ${productId || 'undefined'}`
        });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Item quantity must be a positive integer of at least 1'
        });
      }

      sanitizedItems.push({ productId: productId.toString(), quantity });
    }

    // 4. Fetch live products from database (never trust client prices or stock)
    const productIds = sanitizedItems.map((item) => item.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).populate(
      'seller',
      'name businessName sellerApprovalStatus'
    );

    const productMap = new Map();
    dbProducts.forEach((p) => productMap.set(p._id.toString(), p));

    // Verify all products exist
    for (const item of sanitizedItems) {
      if (!productMap.has(item.productId)) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} was not found in the catalogue`
        });
      }
    }

    // 5. Verify availability, published state, seller status, and inventory
    for (const item of sanitizedItems) {
      const product = productMap.get(item.productId);

      if (product.isArchived) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" has been archived and is no longer available for purchase`
        });
      }

      if (product.isPublished === false) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" is currently unpublished`
        });
      }

      if (!product.seller || product.seller.sellerApprovalStatus !== 'approved') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" belongs to an artisan studio that is not publicly approved`
        });
      }

      if (product.stockCount < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.title}". Requested: ${item.quantity}, Available in studio: ${product.stockCount}`
        });
      }
    }

    // 6. Recalculate totals on backend using database prices
    let itemsSubtotal = 0;
    const verifiedOrderItems = [];
    const sellerGroupMap = new Map();

    for (const item of sanitizedItems) {
      const product = productMap.get(item.productId);
      const verifiedUnitPrice = product.price;
      const itemTotal = verifiedUnitPrice * item.quantity;
      itemsSubtotal += itemTotal;

      const sellerId = (product.seller._id || product.seller).toString();
      const storeName = product.storeName || product.seller.businessName || 'Artisan Studio Direct';

      const orderItemRecord = {
        product: product._id,
        title: product.title,
        quantity: item.quantity,
        price: verifiedUnitPrice,
        imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
        seller: product.seller._id || product.seller,
        storeName,
        itemTotal
      };

      verifiedOrderItems.push(orderItemRecord);

      // Group items by verified artisan studio
      if (!sellerGroupMap.has(sellerId)) {
        sellerGroupMap.set(sellerId, {
          seller: product.seller._id || product.seller,
          storeName,
          items: [],
          subtotal: 0
        });
      }

      const group = sellerGroupMap.get(sellerId);
      group.items.push(orderItemRecord);
      group.subtotal += itemTotal;
    }

    // Cartiva Shipping Policy: Free courier for orders >= ₹2,999; otherwise ₹149 standard
    const shippingFee = itemsSubtotal >= 2999 ? 0 : 149;
    const grandTotal = itemsSubtotal + shippingFee;

    // Generate parent order reference
    const orderReference = generateOrderReference();

    // 7. Structure seller groups with unique sub-order references
    const sellerGroups = [];
    let groupIndex = 1;
    const totalGroups = sellerGroupMap.size;

    for (const [, groupData] of sellerGroupMap.entries()) {
      // Allocate shipping fee across seller groups proportionally or evenly
      const groupShipping = shippingFee > 0 ? Math.round(shippingFee / totalGroups) : 0;
      const groupTotal = groupData.subtotal + groupShipping;

      sellerGroups.push({
        seller: groupData.seller,
        storeName: groupData.storeName,
        subOrderReference: `${orderReference}-S${groupIndex}`,
        items: groupData.items,
        subtotal: groupData.subtotal,
        shippingFee: groupShipping,
        total: groupTotal,
        status: 'Placed'
      });
      groupIndex++;
    }

    // 8. Safely decrement inventory atomically (with automatic rollback on failure)
    for (const item of sanitizedItems) {
      const product = productMap.get(item.productId);
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stockCount: { $gte: item.quantity } },
        { $inc: { stockCount: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        // Concurrency collision occurred; rollback previously decremented items
        for (const dec of decrementedItems) {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stockCount: dec.quantity }
          });
        }
        return res.status(400).json({
          success: false,
          message: `Unable to allocate stock for "${product.title}". Stock changed concurrently. Please review your bag.`
        });
      }

      decrementedItems.push({ productId: item.productId, quantity: item.quantity });
    }

    // 9. Payment method normalization
    const normalizedPaymentMethod = ['cod', 'card', 'upi', 'mock_online'].includes(paymentMethod)
      ? paymentMethod
      : 'cod';

    const paymentResult = {
      status: normalizedPaymentMethod === 'cod' ? 'PENDING_CASH_ON_DELIVERY' : 'COMPLETED_TEST_MODE',
      transactionId: `TEST-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paidAt: new Date()
    };

    // 10. Persist order in database
    const order = await Order.create({
      orderReference,
      user: req.user._id,
      customerInfo: {
        name: fullName.trim(),
        email: req.user.email || 'customer@cartiva.com',
        phone: phone.trim()
      },
      orderItems: verifiedOrderItems,
      sellerGroups,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim()
      },
      itemsSubtotal,
      shippingFee,
      totalAmount: grandTotal,
      paymentMethod: normalizedPaymentMethod,
      paymentResult,
      orderStatus: 'Placed'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully and allocated to artisan studios',
      order
    });
  } catch (error) {
    // Rollback any stock decrements on unexpected database failure
    for (const dec of decrementedItems) {
      await Product.findByIdAndUpdate(dec.productId, {
        $inc: { stockCount: dec.quantity }
      }).catch(() => {});
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while placing order'
    });
  }
};

/**
 * @desc    Get logged in customer orders
 * @route   GET /api/orders/my-orders
 * @access  Private (Authenticated Customer)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your orders'
    });
  }
};

/**
 * @desc    Get order by ID or orderReference with strict multi-vendor isolation
 * @route   GET /api/orders/:id
 * @access  Private (Owner, Seller with products in order, or Admin)
 */
const getOrderById = async (req, res) => {
  try {
    const param = req.params.id;

    // Search by ObjectId if valid, else search by unique orderReference
    const query = mongoose.Types.ObjectId.isValid(param)
      ? { $or: [{ _id: param }, { orderReference: param }] }
      : { orderReference: param };

    const order = await Order.findOne(query).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const isOwner = order.user && (order.user._id || order.user).toString() === userIdStr;
    const isAdmin = req.user.role === 'admin';

    // Check if the user is a seller whose products are in this order
    const isParticipatingSeller =
      req.user.role === 'seller' &&
      order.orderItems.some((item) => item.seller && item.seller.toString() === userIdStr);

    if (!isOwner && !isAdmin && !isParticipatingSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // MULTI-VENDOR ISOLATION:
    // If a participating seller is viewing the order, sanitize and return ONLY their own products & group
    if (isParticipatingSeller && !isAdmin && !isOwner) {
      const sellerItems = order.orderItems.filter(
        (item) => item.seller && item.seller.toString() === userIdStr
      );
      const sellerGroup = order.sellerGroups.find(
        (g) => g.seller && g.seller.toString() === userIdStr
      );

      const isolatedOrder = {
        _id: order._id,
        orderReference: order.orderReference,
        subOrderReference: sellerGroup?.subOrderReference || `${order.orderReference}-S`,
        createdAt: order.createdAt,
        orderStatus: sellerGroup?.status || order.orderStatus,
        customerInfo: {
          name: order.shippingAddress.fullName || order.customerInfo?.name,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          phone: order.shippingAddress.phone
        },
        shippingAddress: order.shippingAddress,
        items: sellerItems,
        sellerGroup: sellerGroup || null,
        sellerSubtotal: sellerGroup ? sellerGroup.subtotal : 0,
        sellerTotal: sellerGroup ? sellerGroup.total : 0
      };

      return res.status(200).json({
        success: true,
        isSellerView: true,
        order: isolatedOrder
      });
    }

    // Owner customer or Admin gets the full order view
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order details'
    });
  }
};

/**
 * @desc    Get incoming orders for authenticated seller (strictly isolated to their items only)
 * @route   GET /api/orders/seller/my-orders
 * @access  Private (Approved Seller)
 */
const getSellerOrders = async (req, res) => {
  try {
    const sellerIdStr = req.user._id.toString();

    // Query all orders containing products belonging to this seller
    const orders = await Order.find({ 'orderItems.seller': req.user._id }).sort({
      createdAt: -1
    });

    // Sanitize each order: filter out products and financials of other sellers
    const isolatedOrders = orders.map((order) => {
      const sellerItems = order.orderItems.filter(
        (item) => item.seller && item.seller.toString() === sellerIdStr
      );
      const sellerGroup = order.sellerGroups.find(
        (g) => g.seller && g.seller.toString() === sellerIdStr
      );

      return {
        _id: order._id,
        orderReference: order.orderReference,
        subOrderReference: sellerGroup?.subOrderReference || `${order.orderReference}-S`,
        createdAt: order.createdAt,
        orderStatus: sellerGroup?.status || order.orderStatus,
        shippingAddress: {
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country
        },
        items: sellerItems,
        itemsCount: sellerItems.reduce((acc, it) => acc + it.quantity, 0),
        subtotal: sellerGroup ? sellerGroup.subtotal : 0,
        shippingFee: sellerGroup ? sellerGroup.shippingFee : 0,
        total: sellerGroup ? sellerGroup.total : 0,
        paymentStatus: order.paymentResult?.status || 'COMPLETED_TEST_MODE'
      };
    });

    res.status(200).json({
      success: true,
      count: isolatedOrders.length,
      orders: isolatedOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching studio orders'
    });
  }
};

/**
 * @desc    Get all orders across marketplace
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching marketplace orders'
    });
  }
};

/**
 * @desc    Update order or seller sub-group status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin or Seller for their own sub-group)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, subOrderReference } = req.body;
    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values are: ${validStatuses.join(', ')}`
      });
    }

    const param = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(param)
      ? { $or: [{ _id: param }, { orderReference: param }] }
      : { orderReference: param };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';

    if (!isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update order status'
      });
    }

    if (isSeller && !isAdmin) {
      // Find the seller's specific group in this order
      const sellerGroup = order.sellerGroups.find(
        (g) => g.seller && g.seller.toString() === userIdStr
      );

      if (!sellerGroup) {
        return res.status(403).json({
          success: false,
          message: 'You have no products in this order to update'
        });
      }

      sellerGroup.status = orderStatus;

      // If all seller groups are Shipped/Delivered, update top-level status
      const allDelivered = order.sellerGroups.every((g) => g.status === 'Delivered');
      const allShipped = order.sellerGroups.every((g) => ['Shipped', 'Delivered'].includes(g.status));

      if (allDelivered) {
        order.orderStatus = 'Delivered';
      } else if (allShipped) {
        order.orderStatus = 'Shipped';
      } else {
        order.orderStatus = 'Processing';
      }

      await order.save();

      return res.status(200).json({
        success: true,
        message: `Sub-order status updated to ${orderStatus}`,
        sellerGroup
      });
    }

    // Admin updates top-level status or target sub-order
    if (subOrderReference) {
      const targetGroup = order.sellerGroups.find(
        (g) => g.subOrderReference === subOrderReference
      );
      if (targetGroup) {
        targetGroup.status = orderStatus;
      }
    } else {
      order.orderStatus = orderStatus;
      // Propagate to all seller groups if top-level status is updated by admin
      order.sellerGroups.forEach((g) => {
        g.status = orderStatus;
      });
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order status'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus
};