const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockAdjustment = require('../models/StockAdjustment');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/products
router.get('/', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/products/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/products
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, sku, category, currentStock, unitCost, sellingPrice, reorderThreshold, safetyStock } = req.body;
    
    if (!name || !sku) {
      return res.status(400).json({ message: 'Product name and SKU are required' });
    }

    const existingSKU = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSKU) {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      category: category || 'General',
      currentStock: Number(currentStock) || 0,
      unitCost: Number(unitCost) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      reorderThreshold: Number(reorderThreshold) || 10,
      safetyStock: Number(safetyStock) || 5
    });

    // Log initial stock adjustment if currentStock > 0
    if (product.currentStock > 0) {
      await StockAdjustment.create({
        productId: product._id,
        changeAmount: product.currentStock,
        reason: 'Initial Seed',
        staffId: req.user._id,
        staffName: req.user.name
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/products/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, category, unitCost, sellingPrice, reorderThreshold, safetyStock } = req.body;
    
    if (name) product.name = name;
    if (category) product.category = category;
    if (unitCost !== undefined) product.unitCost = Number(unitCost);
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (reorderThreshold !== undefined) product.reorderThreshold = Number(reorderThreshold);
    if (safetyStock !== undefined) product.safetyStock = Number(safetyStock);

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/products/:id/adjust-stock
router.post('/:id/adjust-stock', protect, async (req, res) => {
  try {
    const { changeAmount, reason } = req.body;
    if (changeAmount === undefined || !reason) {
      return res.status(400).json({ message: 'changeAmount and reason are required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const delta = Number(changeAmount);
    if (product.currentStock + delta < 0) {
      return res.status(400).json({ message: 'Stock adjustment would result in negative inventory' });
    }

    product.currentStock += delta;
    await product.save();

    const adjustment = await StockAdjustment.create({
      productId: product._id,
      changeAmount: delta,
      reason,
      staffId: req.user._id,
      staffName: req.user.name
    });

    res.json({ product, adjustment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/products/import-csv
router.post('/import-csv', protect, adminOnly, async (req, res) => {
  try {
    const { products } = req.body; // Array of product objects from parsed CSV
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No valid products provided for CSV import' });
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of products) {
      if (!item.name || !item.sku) {
        skippedCount++;
        continue;
      }

      const skuUpper = item.sku.trim().toUpperCase();
      const existing = await Product.findOne({ sku: skuUpper });

      if (existing) {
        skippedCount++;
        continue;
      }

      const product = await Product.create({
        name: item.name.trim(),
        sku: skuUpper,
        category: item.category || 'General',
        currentStock: Number(item.currentStock) || 0,
        unitCost: Number(item.unitCost) || 0,
        sellingPrice: Number(item.sellingPrice) || Number(item.unitCost) * 1.5 || 0,
        reorderThreshold: Number(item.reorderThreshold) || 10,
        safetyStock: Number(item.safetyStock) || 5
      });

      if (product.currentStock > 0) {
        await StockAdjustment.create({
          productId: product._id,
          changeAmount: product.currentStock,
          reason: 'Initial Seed',
          staffId: req.user._id,
          staffName: req.user.name
        });
      }

      createdCount++;
    }

    res.json({ message: `CSV Import Complete. Created: ${createdCount}, Skipped: ${skippedCount}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
