const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { protect } = require('../middleware/auth');
const { createReplenishmentRecommendation } = require('../services/replenishmentService');

// @route GET /api/replenishment
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    const recommendations = await Promise.all(products.map(async (product) => {
      const sales = await Sale.find({ productId: product._id }).select('date quantity').lean();
      return createReplenishmentRecommendation(product, sales, req.query);
    }));
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
