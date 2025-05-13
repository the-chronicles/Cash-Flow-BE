const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const fs = require("fs"); // <-- ✅ Add this
const path = require("path");

const authRoutes = require("./src/routes/auth.routes");
const loanRoutes = require("./src/routes/loan.routes");
const adminRoutes = require("./src/routes/admin.routes");
const repaymentRoutes = require("./src/routes/repayment.routes");

dotenv.config();

const app = express();

// 🔒 Ensure /src/uploads exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'  // or any folder you prefer
}));


// ✅ Serve static files from the correct uploads directory
app.use('/uploads', express.static(uploadsDir));

// 🔌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/repayment", repaymentRoutes);
app.use('/api/config', require('./src/routes/config.routes'));



app.get("/", (req, res) => {
  res.send("Welcome to the Loan API!");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    require("./src/cron/paymentReminder");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
