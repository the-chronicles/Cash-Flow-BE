const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const loanSchema = new mongoose.Schema({
  loanType: {
    type: String,
    required: true,
    enum: ['personal', 'home', 'auto', 'education', 'business']
  },
  amount: {
    type: Number,
    required: true,
    min: 50,
    max: 500
  },
  paymentFrequency: {
    type: String,
    required: true,
    enum: ['weekly', 'monthly']
  },
  installments: {
    type: Number,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  interestRate: {
    type: Number,
    default: 8.9
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected', 'paid']
  },
  employment: {
    type: String,
    required: true,
    enum: ['full_time', 'part_time', 'self_employed', 'unemployed', 'retired']
  },
  income: {
    type: Number,
    required: true
  },
  payFrequency: {
    type: String,
    required: true,
    enum: ['weekly', 'biweekly', 'semimonthly', 'monthly']
  },
  nextPayDate: {
    type: Date,
    required: true
  },
  hasDirectDeposit: {
    type: Boolean,
    required: true
  },
  // Optional fields
  socialSecurityNumber: String,
  idType: String,
  idDocumentPath: String,
  accountType: String,
  routingNumber: String,
  accountNumber: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

loanSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Loan", loanSchema);