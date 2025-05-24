const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');
const authMiddleware = require('../utils/auth.middleware');

// Get notifications for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Mark a specific notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true }
  );
  res.json({ success: true });
});

module.exports = router;
