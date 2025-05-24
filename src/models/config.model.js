const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    interestRate: {
      type: Number,
      default: 0.089 / 52, // weekly APR
    },
    interestRateHistory: [
      {
        value: Number,
        changedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", configSchema);
