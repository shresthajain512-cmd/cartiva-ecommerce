const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be a positive number']
    },
    category: {
      type: String,
      required: [true, 'Please assign a category'],
      enum: ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Fitness', 'Other'],
      default: 'Other'
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide a product image URL'],
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
    },
    stockCount: {
      type: Number,
      required: [true, 'Please specify available stock count'],
      min: [0, 'Stock count cannot be negative'],
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
