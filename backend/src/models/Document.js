const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'Transaction reference is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required']
    },
    title: {
        type: String,
        required: [true, 'Please provide a title for the document'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    file: {
    url: {
      type: String,
      required: [true, 'File URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'File public ID is required']
    },
    type: {
      type: String,
      enum: ['image', 'pdf', 'document'],
      required: true
    },
    size: Number,
    format: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
documentSchema.index({ product: 1, createdAt: -1 });
documentSchema.index({ transaction: 1 });
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);