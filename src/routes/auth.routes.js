// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const router = express.Router();
// const User = require('../models/user.model');

// // Signup
// router.post('/signup', async (req, res) => {
//   const { name, email, password } = req.body;
//   const hashed = await bcrypt.hash(password, 10);
//   try {
//     const user = await User.create({ name, email, password: hashed });
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ error: 'User already exists' });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ error: 'Invalid credentials' });
//   }
//   const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
//   res.json({ token });
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const { signUp, login } = require("../controllers/auth.controller");

// Signup Route
router.post("/signup", signUp);

// Login Route
router.post("/login", login);

module.exports = router;
