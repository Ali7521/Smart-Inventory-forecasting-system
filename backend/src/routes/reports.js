const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const StockAdjustment = require('../models/StockAdjustment');
const { protect } = require('../middleware/auth');

// @route GET /api/reports/inventory
router.get('/inventory', protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    
    let totalItems = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    const categoryValuation = {};

    products.forEach(p => {
      totalItems += p.currentStock;
      const val = p.currentStock * p.unitCost;
      totalValue += val;

      if (p.currentStock <= p.reorderThreshold) {
        lowStockCount++;
      }

      categoryValuation[p.category] = (categoryValuation[p.category] || 0) + val;
    });

    res.json({
      summary: {
        totalProductsCount: products.length,
        totalItemsInStock: totalItems,
        totalInventoryValue: parseFloat(totalValue.toFixed(2)),
        lowStockCount
      },
      categoryValuation,
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reports/sales
router.get('/sales', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        query.date.$lte = eDate;
      }
    }

    const sales = await Sale.find(query).populate('productId', 'name sku category');

    let totalRevenue = 0;
    let totalUnitsSold = 0;
    const productSalesMap = {};

    sales.forEach(s => {
      totalRevenue += s.totalAmount;
      totalUnitsSold += s.quantity;

      const pName = s.productId ? s.productId.name : 'Unknown Product';
      if (!productSalesMap[pName]) {
        productSalesMap[pName] = {
          productName: pName,
          sku: s.productId ? s.productId.sku : 'N/A',
          unitsSold: 0,
          revenue: 0
        };
      }
      productSalesMap[pName].unitsSold += s.quantity;
      productSalesMap[pName].revenue += s.totalAmount;
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      summary: {
        totalTransactions: sales.length,
        totalUnitsSold,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
      },
      topSellingProducts,
      transactions: sales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reports/stock-logs
router.get('/stock-logs', protect, async (req, res) => {
  try {
    const logs = await StockAdjustment.find()
      .populate('productId', 'name sku')
      .sort({ date: -1 })
      .limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
