const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Sale = require('../models/Sale');
const { generateProductForecast } = require('../services/forecastingEngine');
const forecastingModel = require('../services/ml/forecastModelService');
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

// @route POST /api/forecast
// Accepts externally supplied historical data for previewing an inference, or
// reads a product's stored sales history when productId is supplied.
router.post('/', protect, async (req, res) => {
  try {
    const { productId, sales, horizonDays, periodDays, method } = req.body;
    let historicalSales = sales;

    if (!Array.isArray(historicalSales) && productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      historicalSales = await Sale.find({ productId }).select('date quantity').lean();
    }

    if (!Array.isArray(historicalSales)) {
      return res.status(400).json({
        message: 'Provide a sales array of { date, quantity } records or a valid productId.'
      });
    }

    const forecast = await forecastingModel.forecast({
      sales: historicalSales,
      horizonDays: horizonDays || periodDays || 14,
      method: method || 'WMA'
    });

    res.json({ productId: productId || null, ...forecast });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
