const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.middleware');
const Loan = require('../models/loan.model');
const Repayment = require('../models/repayment.model');
const path = require('path');
const fs = require('fs');

router.post('/apply', authMiddleware, async (req, res) => {
  try {
    // Define required fields
    const requiredFields = [
      'loanType', 
      'amount', 
      'paymentFrequency', 
      'installments',
      'purpose', 
      'employment', 
      'income', 
      'payFrequency',
      'nextPayDate', 
      'hasDirectDeposit'
    ];

    // Check for missing fields
    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // Process file upload
    // Process file upload
const file = req.files?.document;
let idDocumentPath = '';

if (file) {
  // Store in root-level /uploads folder (one level above /src)
  const uploadDir = path.join(__dirname, '../uploads'); // src/uploads
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}_${file.name}`;
  idDocumentPath = `/uploads/${fileName}`; // Public-facing URL
  await file.mv(path.join(uploadDir, fileName));
}


    // Create loan
    const loan = await Loan.create({
      ...req.body,
      idDocumentPath,
      userId: req.user.id,
      status: 'pending',
      interestRate: 8.9
    });

    res.status(201).json(loan);
  } catch (err) {
    console.error('Loan application error:', err);
    res.status(400).json({ 
      error: 'Loan application failed',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
});

router.get('/my-loans', authMiddleware, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Newest first
    
    res.json(loans);
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).json({ 
      error: 'Failed to fetch loans',
      message: err.message 
    });
  }
});



module.exports = router;