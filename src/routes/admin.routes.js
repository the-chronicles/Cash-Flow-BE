const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.middleware');
const Loan = require('../models/loan.model');
const User = require('../models/user.model');
const Repayment = require('../models/repayment.model');

router.use(authMiddleware);  // Apply authentication middleware to all routes

// Route to get all loans
router.get('/loans', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const loans = await Loan.find().populate('userId');
  res.json(loans);
});

// Route to update loan status
router.patch('/loan/:id/status', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { status } = req.body;
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  loan.status = status;
  await loan.save();

  // Automatically generate repayment schedule if approved
  if (status === 'approved') {
    const numberOfInstallments = 6;
    const installmentAmount = loan.amount / numberOfInstallments;

    const repayments = [];
    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      repayments.push({
        loanId: loan._id,
        amountPaid: installmentAmount,
        dueDate,
      });
    }

    await Repayment.insertMany(repayments);
  }

  res.json(loan);
});

// Route to get all users (for admin purposes)
router.get('/users', async (req, res) => {
  // Ensure the user is an admin
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    const users = await User.find();  // Fetch all users
    res.json(users);  // Send the users' data back as JSON
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

module.exports = router;
