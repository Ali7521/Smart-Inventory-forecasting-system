const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route GET /api/inventory
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products.map((product) => {
      const reorderPoint = product.reorderThreshold + product.safetyStock;
      return {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        currentStock: product.currentStock,
        leadTimeDays: product.leadTimeDays || 7,
        safetyStock: product.safetyStock,
        reorderThreshold: product.reorderThreshold,
        status: product.currentStock <= reorderPoint ? 'LOW_STOCK' : 'HEALTHY'
      };
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
