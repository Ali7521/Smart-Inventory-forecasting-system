const express = require('express');
const router = express.Router();
const seedDatabase = require('../services/seedData');

// @route POST /api/seed
router.post('/', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.json({ message: 'Database successfully seeded with mock products and 90 days of sales history!', result });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding database', error: error.message });
  }
});

module.exports = router;
