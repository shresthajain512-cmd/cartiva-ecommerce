const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price cannot be negative']
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image URL is required']
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
      index: true
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true
    },
    itemTotal: {
      type: Number,
      required: [true, 'Item total is required'],
      min: [0, 'Item total cannot be negative']
    }
  },
  { _id: false }
);

const sellerGroupSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
      index: true
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true
    },
    subOrderReference: {
      type: String,
      required: [true, 'Sub-order reference is required']
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: [true, 'Seller subtotal is required'],
      min: 0
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: [true, 'Seller total is required'],
      min: 0
    },
    status: {
      type: String,
      enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed'
    }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderReference: {
      type: String,
      required: [true, 'Order reference ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    customerInfo: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true }
    },
    orderItems: [orderItemSchema],
    sellerGroups: [sellerGroupSchema],
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, default: 'India', trim: true }
    },
    itemsSubtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: 0
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi', 'mock_online'],
      default: 'cod'
    },
    paymentResult: {
      status: { type: String, default: 'COMPLETED_TEST_MODE' },
      transactionId: { type: String, default: () => `TEST-TXN-${Date.now()}` },
      paidAt: { type: Date, default: Date.now }
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed'
    }
  },
  {
    timestamps: true
  }
);

// High performance indexes for customer order history, seller isolation, and parent references
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'sellerGroups.seller': 1, createdAt: -1 });
orderSchema.index({ 'orderItems.seller': 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
