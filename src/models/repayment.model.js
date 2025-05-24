const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
  amountPaid: Number,
  dueDate: Date,
  status: { type: String, default: 'unpaid' },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
  paidAt: Date,
  paymentMethod: { type: String, enum: ['cash', 'bank', 'mobile', 'check', 'other'] }
});

module.exports = mongoose.model('Repayment', repaymentSchema);