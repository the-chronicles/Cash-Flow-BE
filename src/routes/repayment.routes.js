const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/auth.middleware");
const repaymentController = require("../controllers/repayment.controller");

router.post(
  "/generate",
  authMiddleware,
  repaymentController.generateRepaymentSchedule
);

router.get("/my-repayments", authMiddleware, async (req, res) => {
  try {
    // Find loans created by this user
    const loans = await Loan.find({ userId: req.user.id }).select("_id");
    const loanIds = loans.map((loan) => loan._id);

    const repayments = await Repayment.find({ loanId: { $in: loanIds } }).sort({
      dueDate: 1,
    });

    res.json(repayments);
  } catch (error) {
    console.error("Error fetching repayments:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
