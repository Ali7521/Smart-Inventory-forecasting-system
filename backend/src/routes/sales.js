const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockAdjustment = require('../models/StockAdjustment');
const { protect } = require('../middleware/auth');

// @route POST /api/sales
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity, unitPrice, date } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid productId and quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.currentStock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock! Current stock: ${product.currentStock}, Requested: ${quantity}`
      });
    }

    const price = unitPrice !== undefined ? Number(unitPrice) : product.sellingPrice;
    const totalAmount = parseFloat((quantity * price).toFixed(2));
    const saleDate = date ? new Date(date) : new Date();

    const sale = await Sale.create({
      productId: product._id,
      quantity: Number(quantity),
      unitPrice: price,
      totalAmount,
      date: saleDate,
      staffId: req.user._id,
      staffName: req.user.name
    });

    // Auto-decrement current stock
    product.currentStock -= Number(quantity);
    await product.save();

    // Log stock adjustment
    await StockAdjustment.create({
      productId: product._id,
      changeAmount: -Number(quantity),
      reason: 'Sale',
      date: saleDate,
      staffId: req.user._id,
      staffName: req.user.name
    });

    res.status(201).json({ sale, updatedStock: product.currentStock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/sales
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, productId } = req.query;
    let query = {};

    if (productId) {
      query.productId = productId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        query.date.$lte = eDate;
      }
    }

    const sales = await Sale.find(query)
      .populate('productId', 'name sku category')
      .sort({ date: -1 })
      .limit(500);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/sales/:productId
router.get('/:productId', protect, async (req, res) => {
  try {
    const sales = await Sale.find({ productId: req.params.productId })
      .sort({ date: -1 })
      .limit(200);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
