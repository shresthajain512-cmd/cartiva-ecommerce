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
      trim: true,
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
      enum: {
        values: ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Fitness', 'Other'],
        message: '{VALUE} is not a valid category'
      },
      default: 'Other'
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide a product image URL'],
      trim: true,
      default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
    },
    stockCount: {
      type: Number,
      required: [true, 'Please specify available stock count'],
      min: [0, 'Stock count cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value for stock count'
      },
      default: 0
    },
    // Multi-Vendor Storefront & Ownership References
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product must belong to a seller'],
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    storeName: {
      type: String,
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters']
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    // Enhanced catalogue attributes
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be positive']
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.8
    },
    reviewsCount: {
      type: Number,
      min: 0,
      default: 0
    },
    specs: {
      type: Map,
      of: String
    },
    images: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true
    }],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance catalogue discovery and seller product management
productSchema.index({ seller: 1, isArchived: 1, createdAt: -1 });
productSchema.index({ isPublished: 1, isArchived: 1, category: 1, createdAt: -1 });
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
