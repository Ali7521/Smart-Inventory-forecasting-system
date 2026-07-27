const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    default: 'General'
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    default: 0.0,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: 0
  },
  reorderThreshold: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  safetyStock: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
