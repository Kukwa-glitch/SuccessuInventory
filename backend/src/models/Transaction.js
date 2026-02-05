const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  type: {
    type: String,
    enum: ['add', 'deduct', 'adjust'],
    required: [true, 'Transaction type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for this transaction'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  document: {
    url: String,
    publicId: String,
    type: {
      type: String,
      enum: ['image', 'pdf', 'document']
    }
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ product: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ performedBy: 1, createdAt: -1 });

// Method to get formatted transaction
transactionSchema.methods.getFormatted = function() {
  return {
    id: this._id,
    product: this.product,
    type: this.type,
    quantity: this.quantity,
    change: this.type === 'add' ? `+${this.quantity}` : `-${this.quantity}`,
    previousQuantity: this.previousQuantity,
    newQuantity: this.newQuantity,
    reason: this.reason,
    notes: this.notes,
    document: this.document,
    performedBy: this.performedBy,
    date: this.createdAt
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);