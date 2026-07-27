const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const StockAdjustment = require('../models/StockAdjustment');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');

const SAMPLE_PRODUCTS = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    sku: 'AUDIO-WNC-01',
    category: 'Electronics',
    currentStock: 12,
    unitCost: 85.00,
    sellingPrice: 149.99,
    reorderThreshold: 20,
    safetyStock: 10,
    baseDailySales: 3.5,
    volatility: 1.2
  },
  {
    name: 'Ergonomic Mechanical Keyboard',
    sku: 'PERIPH-EMK-02',
    category: 'Electronics',
    currentStock: 8,
    unitCost: 45.00,
    sellingPrice: 89.99,
    reorderThreshold: 15,
    safetyStock: 8,
    baseDailySales: 2.8,
    volatility: 1.0
  },
  {
    name: 'Organic Espresso Coffee Beans (1kg)',
    sku: 'GROC-ECB-10',
    category: 'Groceries',
    currentStock: 45,
    unitCost: 12.50,
    sellingPrice: 24.99,
    reorderThreshold: 30,
    safetyStock: 15,
    baseDailySales: 6.2,
    volatility: 1.8
  },
  {
    name: 'Stainless Steel Water Bottle 1L',
    sku: 'ACC-SSWB-05',
    category: 'Accessories',
    currentStock: 4,
    unitCost: 6.00,
    sellingPrice: 18.50,
    reorderThreshold: 25,
    safetyStock: 12,
    baseDailySales: 4.5,
    volatility: 1.5
  },
  {
    name: 'Cotton Graphic Hoodie (L)',
    sku: 'APP-CGH-L',
    category: 'Apparel',
    currentStock: 32,
    unitCost: 18.00,
    sellingPrice: 42.00,
    reorderThreshold: 15,
    safetyStock: 10,
    baseDailySales: 2.1,
    volatility: 0.9
  },
  {
    name: 'Smart Fitness Watch Series 5',
    sku: 'ELEC-SFW-05',
    category: 'Electronics',
    currentStock: 2,
    unitCost: 110.00,
    sellingPrice: 199.99,
    reorderThreshold: 10,
    safetyStock: 5,
    baseDailySales: 1.8,
    volatility: 0.8
  },
  {
    name: 'Minimalist Leather Backpack',
    sku: 'ACC-MLB-09',
    category: 'Accessories',
    currentStock: 19,
    unitCost: 35.00,
    sellingPrice: 79.99,
    reorderThreshold: 12,
    safetyStock: 6,
    baseDailySales: 1.4,
    volatility: 0.7
  }
];

async function seedDatabase() {
  try {
    console.log('Seeding Database with sample products and 90 days of sales history...');

    // Clear existing collection data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await StockAdjustment.deleteMany({});
    await Settings.deleteMany({});

    // Create Admin User & Staff User
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const staffPasswordHash = await bcrypt.hash('staff123', 10);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@inventory.com',
      passwordHash: adminPasswordHash,
      role: 'Admin'
    });

    const staffUser = await User.create({
      name: 'Sarah Connor (Staff)',
      email: 'staff@inventory.com',
      passwordHash: staffPasswordHash,
      role: 'Staff'
    });

    // Create default Settings
    await Settings.create({
      defaultSafetyStockPct: 20,
      defaultForecastMethod: 'WMA',
      forecastPeriodDays: 14,
      emailNotificationsEnabled: true,
      alertEmail: 'admin@inventory.com'
    });

    // Create Products and Generate 90 Days of Mock Sales
    const createdProducts = [];
    const salesToInsert = [];
    const stockAdjustmentsToInsert = [];

    const now = new Date();

    for (const prodData of SAMPLE_PRODUCTS) {
      const { baseDailySales, volatility, ...pData } = prodData;
      const product = await Product.create(pData);
      createdProducts.push(product);

      // Stock adjustment log for initial seed
      stockAdjustmentsToInsert.push({
        productId: product._id,
        changeAmount: product.currentStock,
        reason: 'Initial Seed',
        date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        staffId: adminUser._id,
        staffName: adminUser.name
      });

      // Generate daily sales for 90 days
      for (let dayOffset = 90; dayOffset >= 1; dayOffset--) {
        const saleDate = new Date(now);
        saleDate.setDate(saleDate.getDate() - dayOffset);

        // Day of week boost (Weekends sell 40% more)
        const isWeekend = saleDate.getDay() === 0 || saleDate.getDay() === 6;
        const weekendFactor = isWeekend ? 1.4 : 1.0;

        // Slight upward growth trend factor over 90 days
        const trendFactor = 1 + ((90 - dayOffset) / 180);

        // Random noise based on volatility
        const noise = (Math.random() - 0.4) * volatility;
        let qty = Math.round((baseDailySales * weekendFactor * trendFactor) + noise);
        if (qty < 0) qty = 0;

        if (qty > 0) {
          salesToInsert.push({
            productId: product._id,
            quantity: qty,
            unitPrice: product.sellingPrice,
            totalAmount: parseFloat((qty * product.sellingPrice).toFixed(2)),
            date: saleDate,
            staffId: staffUser._id,
            staffName: staffUser.name
          });
        }
      }
    }

    await Sale.insertMany(salesToInsert);
    await StockAdjustment.insertMany(stockAdjustmentsToInsert);

    console.log(`Seeding complete! Inserted ${createdProducts.length} products and ${salesToInsert.length} sales records.`);
    return {
      productsCount: createdProducts.length,
      salesCount: salesToInsert.length,
      adminEmail: 'admin@inventory.com',
      staffEmail: 'staff@inventory.com'
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

module.exports = seedDatabase;
