const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        title: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true }
      }
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' }
    },
    paymentResult: {
      status: { type: String, default: 'COMPLETED_TEST_MODE' },
      transactionId: { type: String, default: () => `TEST-TXN-${Date.now()}` },
      paidAt: { type: Date, default: Date.now }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
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

module.exports = mongoose.model('Order', orderSchema);
