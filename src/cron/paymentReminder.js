const cron = require('node-cron');
const Repayment = require('../models/repayment.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const dueRepayments = await Repayment.find({
    status: 'unpaid',
    dueDate: { $lte: tomorrow },
  }).populate({
  path: 'loanId',
  populate: { path: 'userId' }
});


  for (const r of dueRepayments) {
    await Notification.create({
      userId: r.loanId.userId,
      title: 'Repayment Due Soon',
      message: `You have a payment of $${r.amountPaid} due on ${new Date(r.dueDate).toLocaleDateString()}.`,
      type: 'reminder',
      relatedId: r.loanId._id
    });
  }
});
