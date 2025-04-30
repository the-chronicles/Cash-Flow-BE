const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.middleware');
const Loan = require('../models/loan.model');
const Repayment = require('../models/repayment.model');
const path = require('path');
const fs = require('fs');

router.post('/apply', authMiddleware, async (req, res) => {
    try {
      const { amount, interestRate, repaymentTerm } = req.body;
      const file = req.files?.document; // Handle file if available
  
      let filePath = '';
      if (file) {
        // Check if file is provided
        filePath = `uploads/${Date.now()}_${file.name}`;
        await file.mv(filePath);
      }
  
      const loan = await Loan.create({
        amount,
        interestRate,
        repaymentTerm,
        userId: req.user.id,
        documentPath: filePath,
      });
  
      res.status(201).json(loan);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Loan application failed' });
    }
  });
  

router.get('/my-loans', authMiddleware, async (req, res) => {
  const loans = await Loan.find({ userId: req.user.id });
  res.json(loans);
});

module.exports = router;