const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.middleware');
const Loan = require('../models/loan.model');
const Repayment = require('../models/repayment.model');
const path = require('path');
const fs = require('fs');

router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const {
      loanType,
      amount,
      paymentFrequency,
      installments,
      purpose,
      employment,
      income,
      payFrequency,
      nextPayDate,
      hasDirectDeposit,
      socialSecurityNumber,
      idType,
      accountType,
      routingNumber,
      accountNumber
    } = req.body;

    const file = req.files?.document;
    let idDocumentPath = '';

    if (file) {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      idDocumentPath = `uploads/${Date.now()}_${file.name}`;
      await file.mv(path.join(__dirname, `../${idDocumentPath}`));
    }

    const loan = await Loan.create({
      loanType,
      amount,
      paymentFrequency,
      installments,
      purpose,
      employment,
      income,
      payFrequency,
      nextPayDate: new Date(nextPayDate),
      hasDirectDeposit,
      socialSecurityNumber,
      idType,
      idDocumentPath,
      accountType,
      routingNumber,
      accountNumber,
      userId: req.user.id,
      interestRate: 8.9 // Default interest rate
    });

    res.status(201).json(loan);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Loan application failed', details: err.message });
  }
});
  

router.get('/my-loans', authMiddleware, async (req, res) => {
  const loans = await Loan.find({ userId: req.user.id });
  res.json(loans);
});

module.exports = router;