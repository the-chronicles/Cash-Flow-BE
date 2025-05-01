const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Signup Controller
const signUp = async (req, res) => {
    const { name, email, password } = req.body;
  
    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    // Hash the password
    const hashed = await bcrypt.hash(password, 10);
  
    try {
      // Try to create the user
      const user = await User.create({ name, email, password: hashed });
      res.status(201).json({
        message: "User created successfully",
        user: { name: user.name, email: user.email },
      });
    } catch (err) {
      // Catch any errors, especially validation errors
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      }
      console.error(err);
      res.status(400).json({ error: "User already exists" });
    }
  };
  

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if both fields are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });

  // Check if the user exists and the password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate the JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Send the response with both token and user data
  res.json({
    token: token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
};

module.exports = { signUp, login };