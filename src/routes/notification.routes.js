const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');
const authMiddleware = require('../utils/auth.middleware');

// Get notifications for logged-in user
// router.get('/', authMiddleware, async (req, res) => {
//   const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
//   res.json(notifications);
// });

// notification.routes.js
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Use either the authenticated user or query param as fallback
    const userId = req.user._id || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });
      
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
