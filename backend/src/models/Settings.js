const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  defaultSafetyStockPct: {
    type: Number,
    default: 20 // 20% default buffer
  },
  defaultForecastMethod: {
    type: String,
    enum: ['SMA', 'WMA', 'LinearRegression'],
    default: 'WMA'
  },
  forecastPeriodDays: {
    type: Number,
    default: 14
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  alertEmail: {
    type: String,
    default: 'admin@inventorysystem.com'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
