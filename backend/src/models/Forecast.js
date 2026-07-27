const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  periodDays: {
    type: Number,
    default: 14 // 14-day horizon
  },
  predictedDemand: {
    type: Number,
    required: true
  },
  suggestedReorderQty: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['SMA', 'WMA', 'LinearRegression'],
    default: 'SMA'
  },
  confidenceScore: {
    type: Number, // 0 to 100%
    required: true
  },
  confidenceLabel: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Insufficient Data'],
    default: 'Medium'
  },
  historicalAvgDailySales: {
    type: Number,
    default: 0
  },
  trendSlope: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Forecast', forecastSchema);
