const express = require('express');
const router = express.Router();
const Config = require('../models/config.model');
const authMiddleware = require('../utils/auth.middleware');

// Get current config
router.get('/', authMiddleware, async (req, res) => {
  let config = await Config.findOne();
  if (!config) config = await Config.create({}); // default if none
  res.json(config);
});

// Update interest rate
router.patch('/interest-rate', authMiddleware, async (req, res) => {
  const { interestRate } = req.body;
  if (typeof interestRate !== 'number') {
    return res.status(400).json({ error: 'Interest rate must be a number' });
  }

  let config = await Config.findOne();
  if (!config) {
    config = new Config();
  }
  config.interestRate = interestRate;
  await config.save();

  res.json(config);
});

module.exports = router;
