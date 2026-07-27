const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const { generateProductForecast } = require('../services/forecastingEngine');
const { protect } = require('../middleware/auth');

// @route GET /api/forecast/:productId
router.get('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const settings = await Settings.findOne();
    
    const periodDays = req.query.periodDays ? Number(req.query.periodDays) : (settings?.forecastPeriodDays || 14);
    const method = req.query.method || settings?.defaultForecastMethod || 'WMA';

    const forecast = await generateProductForecast(productId, periodDays, method);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/forecast
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find();
    const settings = await Settings.findOne();

    const periodDays = req.query.periodDays ? Number(req.query.periodDays) : (settings?.forecastPeriodDays || 14);
    const method = req.query.method || settings?.defaultForecastMethod || 'WMA';

    const forecasts = [];
    for (const prod of products) {
      try {
        const fc = await generateProductForecast(prod._id, periodDays, method);
        forecasts.push(fc);
      } catch (err) {
        console.error(`Error forecasting product ${prod._id}:`, err.message);
      }
    }

    res.json(forecasts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
