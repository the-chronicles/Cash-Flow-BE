const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  interestRate: {
    type: Number,
    default: 8.9,
  },
}, { timestamps: true });

module.exports = mongoose.model("Config", configSchema);
