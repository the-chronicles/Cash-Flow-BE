const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.middleware');
const repaymentController = require('../controllers/repayment.controller');

router.post('/generate', authMiddleware, repaymentController.generateRepaymentSchedule);

module.exports = router;
