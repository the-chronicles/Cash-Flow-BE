// src/routes/loanProduct.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.middleware');
const LoanProduct = require('../models/loanProduct.model');
const cloudinary = require('../utils/cloudinary');

// Admin: Create Loan Product
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    const file = req.files?.logo;
    let logoUrl = '';

    if (file) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'loan_products',
      });
      logoUrl = result.secure_url;
    }

    const product = await LoanProduct.create({
      ...req.body,
      logoUrl
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// User: Get All Loan Products
router.get('/', async (req, res) => {
  try {
    const products = await LoanProduct.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
