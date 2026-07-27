const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/settings
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/settings
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const { defaultSafetyStockPct, defaultForecastMethod, forecastPeriodDays, emailNotificationsEnabled, alertEmail } = req.body;

    if (defaultSafetyStockPct !== undefined) settings.defaultSafetyStockPct = Number(defaultSafetyStockPct);
    if (defaultForecastMethod) settings.defaultForecastMethod = defaultForecastMethod;
    if (forecastPeriodDays !== undefined) settings.forecastPeriodDays = Number(forecastPeriodDays);
    if (emailNotificationsEnabled !== undefined) settings.emailNotificationsEnabled = Boolean(emailNotificationsEnabled);
    if (alertEmail) settings.alertEmail = alertEmail;

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
