const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDatabase = require('./services/seedData');
const Product = require('./models/Product');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/seed', require('./routes/seed'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Smart Inventory Forecasting API', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

// Connect DB and start server
connectDB().then(async () => {
  // Auto-seed if database is empty
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database empty! Executing initial database seed...');
      await seedDatabase();
    }
  } catch (seedErr) {
    console.error('Auto seed check error:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Smart Inventory Forecasting API Server running on port ${PORT}`);
  });
});
