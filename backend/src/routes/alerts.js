const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockAdjustment = require('../models/StockAdjustment');
const Settings = require('../models/Settings');
const { generateProductForecast } = require('../services/forecastingEngine');
const { protect } = require('../middleware/auth');

// @route GET /api/alerts
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ currentStock: 1 });
    const settings = await Settings.findOne();
    const method = settings?.defaultForecastMethod || 'WMA';
    const periodDays = settings?.forecastPeriodDays || 14;

    const alertList = [];
    let counts = { lowStock: 0, reorderSoon: 0, healthy: 0 };

    for (const prod of products) {
      const fc = await generateProductForecast(prod._id, periodDays, method);
      
      let status = 'Healthy';
      let badgeColor = 'green';

      if (prod.currentStock <= prod.reorderThreshold) {
        status = 'Low Stock';
        badgeColor = 'red';
        counts.lowStock++;
      } else if (prod.currentStock <= (fc.predictedDemand + prod.safetyStock)) {
        status = 'Reorder Soon';
        badgeColor = 'yellow';
        counts.reorderSoon++;
      } else {
        counts.healthy++;
      }

      alertList.push({
        productId: prod._id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        currentStock: prod.currentStock,
        reorderThreshold: prod.reorderThreshold,
        safetyStock: prod.safetyStock,
        unitCost: prod.unitCost,
        predictedDemand: fc.predictedDemand,
        suggestedReorderQty: fc.suggestedReorderQty,
        confidenceScore: fc.confidenceScore,
        confidenceLabel: fc.confidenceLabel,
        status,
        badgeColor
      });
    }

    res.json({
      summary: counts,
      alerts: alertList
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/alerts/mark-ordered/:productId
router.post('/mark-ordered/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const qtyToAdd = Number(quantity) > 0 ? Number(quantity) : Math.max(10, product.reorderThreshold * 2);

    product.currentStock += qtyToAdd;
    await product.save();

    const adjustment = await StockAdjustment.create({
      productId: product._id,
      changeAmount: qtyToAdd,
      reason: 'Order Marked',
      staffId: req.user._id,
      staffName: req.user.name
    });

    res.json({ message: `Marked order received: Added ${qtyToAdd} units`, product, adjustment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
