const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.middleware');
const Loan = require('../models/loan.model');
const User = require('../models/user.model');
const Repayment = require('../models/repayment.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.model'); // Add this at the top

// Admin Login Route (from DB)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email: admin.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, role: 'admin' });
});


router.use(authMiddleware);  // Apply authentication middleware to all routes

// Route to get all loans
router.get('/loans', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const loans = await Loan.find().populate('userId');
  res.json(loans);
});

// Route to update loan status
// router.patch('/loan/:id/status', async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
//   const { status } = req.body;
//   const loan = await Loan.findById(req.params.id);
//   if (!loan) return res.status(404).json({ error: 'Loan not found' });
//   loan.status = status;
//   await loan.save();

//   // Automatically generate repayment schedule if approved
//   if (status === 'approved') {
//     const numberOfInstallments = 6;
//     const installmentAmount = loan.amount / numberOfInstallments;

//     const repayments = [];
//     for (let i = 1; i <= numberOfInstallments; i++) {
//       const dueDate = new Date();
//       dueDate.setMonth(dueDate.getMonth() + i);
//       repayments.push({
//         loanId: loan._id,
//         amountPaid: installmentAmount,
//         dueDate,
//       });
//     }

//     await Repayment.insertMany(repayments);
//   }

//   res.json(loan);
// });

// Route to update loan status
router.patch('/loan/:id/status', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  const { status, notes } = req.body;
  
  try {
    const loan = await Loan.findById(req.params.id).populate('userId');
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    
    // Update loan status and notes
    loan.status = status;
    if (notes) loan.notes = notes;
    await loan.save();

    // Automatically generate repayment schedule if approved
    if (status === 'approved') {
      const numberOfInstallments = loan.term; // Use the loan term from application
      const installmentAmount = loan.amount / numberOfInstallments;

      const repayments = [];
      for (let i = 1; i <= numberOfInstallments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        repayments.push({
          loanId: loan._id,
          userId: loan.userId._id,
          amount: installmentAmount,
          dueDate,
          status: 'pending'
        });
      }

      await Repayment.insertMany(repayments);
      
      // Update user's loan status
      await User.findByIdAndUpdate(loan.userId._id, {
        $push: { loans: loan._id }
      });
    }

    // Prepare response with updated loan and user info
    const updatedLoan = await Loan.findById(req.params.id).populate('userId');
    
    // Emit real-time update (if using websockets)
    // io.to(loan.userId._id.toString()).emit('loanUpdate', updatedLoan);
    
    res.json(updatedLoan);
  } catch (err) {
    console.error('Error updating loan status:', err);
    res.status(500).json({ error: 'Failed to update loan status' });
  }
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

// Get paginated loan applications with filters
// router.get('/loan-applications', async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

//   try {
//     const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

//     const query = {};
//     if (status) query.status = status;

//     const options = {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
//       populate: 'userId'
//     };

//     const result = await Loan.paginate(query, options);
    
//     res.json({
//       data: result.docs,
//       total: result.totalDocs,
//       page: result.page,
//       limit: result.limit,
//       totalPages: result.totalPages
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch loan applications' });
//   }
// });

// // Get loan application details
// router.get('/loan-applications/:id', async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

//   try {
//     const loan = await Loan.findById(req.params.id).populate('userId');
//     if (!loan) return res.status(404).json({ error: 'Loan not found' });
//     res.json(loan);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch loan details' });
//   }
// });



// Get paginated loan applications with filters
router.get('/loan-applications', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
      populate: 'userId'
    };

    const result = await Loan.paginate(query, options);
    
    res.json({
      data: result.docs,
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loan applications' });
  }
});

// Get loan application details
router.get('/loan-applications/:id', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    const loan = await Loan.findById(req.params.id).populate('userId');
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loan details' });
  }
});


module.exports = router;
