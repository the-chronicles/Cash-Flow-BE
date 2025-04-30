const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // Ensures that the name is required
    },
    email: {
      type: String,
      required: [true, "Email is required"], // Ensures that the email is required
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"], // Valid email format
    },
    password: {
      type: String,
      required: [true, "Password is required"], // Ensures that the password is required
    },
    role: {
      type: String,
      enum: ["borrower", "admin"], // You might have two types of users: borrower and admin
      default: "borrower",
    },
  },
  { timestamps: true } // This will add createdAt and updatedAt fields automatically
);

module.exports = mongoose.model("User", userSchema);
