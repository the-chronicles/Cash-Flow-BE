const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/auth.middleware");
const Loan = require("../models/loan.model");
const Repayment = require("../models/repayment.model");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

router.post("/apply", authMiddleware, async (req, res) => {
  try {
    // Define required fields
    const requiredFields = [
      "loanType",
      "amount",
      "paymentFrequency",
      "installments",
      "purpose",
      "employment",
      "income",
      "payFrequency",
      "nextPayDate",
      "hasDirectDeposit",
    ];

    // Check for missing fields
    const missingFields = requiredFields.filter(
      (field) => !(field in req.body)
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
      });
    }

    const file = req.files?.document;
    let idDocumentUrl = "";

    if (file) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "loan_documents",
        resource_type: "auto", // supports PDFs, images, etc
      });

      idDocumentUrl = result.secure_url;
    }

    // Create loan
    const loan = await Loan.create({
      ...req.body,
      idDocumentPath: idDocumentUrl, // same field name, now stores full Cloudinary URL
      userId: req.user.id,
      status: "pending",
      interestRate: 8.9,
    });

    res.status(201).json(loan);
  } catch (err) {
    console.error("Loan application error:", err);
    res.status(400).json({
      error: "Loan application failed",
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
});

router.get("/my-loans", authMiddleware, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.id }).sort({
      createdAt: -1,
    }); // Newest first

    res.json(loans);
  } catch (err) {
    console.error("Error fetching loans:", err);
    res.status(500).json({
      error: "Failed to fetch loans",
      message: err.message,
    });
  }
});

module.exports = router;
