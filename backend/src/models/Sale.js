const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
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
    default: 'System/Demo'
  }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
