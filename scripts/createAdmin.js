// scripts/createAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('../src/models/admin.model');

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash('admin123', 10); // Change password here
  const admin = new Admin({
    email: 'admin@loanapp.com',
    passwordHash
  });

  await admin.save();
  console.log('Admin created!');
  process.exit();
}

createAdmin();
