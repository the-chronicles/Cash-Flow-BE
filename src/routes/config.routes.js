const express = require('express');
const router = express.Router();
const Config = require('../models/config.model');
const Notification = require('../models/notification.model');
// const Borrower = require('../models/borrower.model');
const User = require('../models/user.model');
const authMiddleware = require('../utils/auth.middleware');

// Get current config
router.get('/', authMiddleware, async (req, res) => {
  let config = await Config.findOne();
  if (!config) config = await Config.create({});
  res.json(config);
});

// Update interest rate (weekly APR)
router.patch('/interest-rate', authMiddleware, async (req, res) => {
    const io = req.app.get('io'); // get the socket.io instance

  const { interestRate } = req.body;
  if (typeof interestRate !== 'number') {
    return res.status(400).json({ error: 'Interest rate must be a number' });
  }

  let config = await Config.findOne();
  if (!config) config = new Config();

  config.interestRate = interestRate; // already weekly decimal (e.g. 0.0017 for 0.17%)
  config.interestRateHistory.push({ value: interestRate, changedAt: new Date() });

  await config.save();

  // const borrowers = await Borrower.find({});
  const borrowers = await User.find({ role: 'borrower' });
  const message = `Interest rate has been updated to ${(interestRate * 100).toFixed(2)}% weekly. Please review your updated loan terms.`;

  await Notification.insertMany(borrowers.map(b => ({
    userId: b._id,
    type: 'interest-update',
    message,
  })));


   borrowers.forEach((b) => {
    io.to(b._id.toString()).emit('notification:new', {
      message,
      type: 'interest-update',
    });
  });

  res.json(config);
});

module.exports = router;