const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Please provide a SKU'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  minStockLevel: {
    type: Number,
    required: [true, 'Please provide minimum stock level'],
    default: 10,
    min: [0, 'Minimum stock level cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Please provide a unit of measurement'],
    default: 'pcs', // pieces
    enum: ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'dozen', 'pair']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    }
  },
  location: {
    type: String,
    trim: true,
    default: 'Main Warehouse'
  },
  image: {
    url: String,
    publicId: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) {
    return 'out-of-stock';
  } else if (this.quantity <= this.minStockLevel) {
    return 'low-stock';
  } else {
    return 'in-stock';
  }
});

// Virtual field for stock value
productSchema.virtual('totalValue').get(function() {
  return this.quantity * this.price;
});

// Index for faster searches
productSchema.index({ name: 'text', sku: 'text', category: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ quantity: 1, minStockLevel: 1 });

module.exports = mongoose.model('Product', productSchema);