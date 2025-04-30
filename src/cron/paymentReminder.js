const cron = require('node-cron');
const Repayment = require('../models/repayment.model');

cron.schedule('0 8 * * *', async () => {
  const dueRepayments = await Repayment.find({ status: 'unpaid' });
  dueRepayments.forEach((r) => {
    console.log(`Reminder: Payment of ${r.amountPaid} is due on ${r.dueDate}`);
  });
});