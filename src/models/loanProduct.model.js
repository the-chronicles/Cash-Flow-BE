// src/models/loanProduct.model.js
const mongoose = require('mongoose');

const loanProductSchema = new mongoose.Schema({
  productName: String,
  description: String,
  minAmount: Number,
  maxAmount: Number,
  minTenor: Number,
  minTenorUnit: { type: String, enum: ['month', 'week', 'biweekly'] },
  maxTenor: Number,
  maxTenorUnit: { type: String, enum: ['month', 'week', 'biweekly'] },
  maxActiveLoans: Number,
  logoUrl: String
}, { timestamps: true });

module.exports = mongoose.model('LoanProduct', loanProductSchema);
