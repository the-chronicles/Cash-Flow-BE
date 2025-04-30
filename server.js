const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/auth.routes");
const loanRoutes = require("./src/routes/loan.routes");
const adminRoutes = require("./src/routes/admin.routes");
const repaymentRoutes = require("./src/routes/repayment.routes");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/repayment", repaymentRoutes);

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
    // Start cron job after MongoDB connection is ready
    require("./src/cron/paymentReminder");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
