const mongoose = require('mongoose');

const stockAdjustmentSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  changeAmount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['Sale', 'Restock / Purchase', 'Damaged / Lost', 'Audit Correction', 'Initial Seed', 'Order Marked'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  staffName: {
    type: String,
    default: 'System'
  }
}, { timestamps: true });

module.exports = mongoose.model('StockAdjustment', stockAdjustmentSchema);
