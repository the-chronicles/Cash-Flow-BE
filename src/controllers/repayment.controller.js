const Loan = require('../models/loan.model');
const Repayment = require('../models/repayment.model');

exports.generateRepaymentSchedule = async (req, res) => {
  try {
    const { loanId, amountPaid, startDate } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const repaymentAmount = amountPaid / 3;
    const repaymentSchedule = [];

    for (let i = 1; i <= 3; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      repaymentSchedule.push({
        amountPaid: repaymentAmount,
        dueDate,
        status: 'unpaid',
        loanId: loan._id,
      });
    }

    const savedRepayments = await Repayment.insertMany(repaymentSchedule);

    res.status(201).json({ message: 'Repayment schedule generated', repayments: savedRepayments });
  } catch (error) {
    console.error('Error generating repayment schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
