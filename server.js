// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const fileUpload = require("express-fileupload");
// const mongoose = require("mongoose");
// const fs = require("fs"); // <-- ✅ Add this
// const path = require("path");

// const authRoutes = require("./src/routes/auth.routes");
// const loanRoutes = require("./src/routes/loan.routes");
// const adminRoutes = require("./src/routes/admin.routes");
// const repaymentRoutes = require("./src/routes/repayment.routes");

// dotenv.config();

// const http = require('http');
// const socketIo = require('socket.io');
// const app = require('./app'); // your Express app
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: '*',
//   },
// });

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });

// // Expose io to use in routes
// app.set('io', io);



// const app = express();

// // 🔒 Ensure /src/uploads exists
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// app.use(cors());
// app.use(express.json());
// app.use(fileUpload({
//   useTempFiles: true,
//   tempFileDir: '/tmp/'  // or any folder you prefer
// }));


// // ✅ Serve static files from the correct uploads directory
// app.use('/uploads', express.static(uploadsDir));

// // 🔌 Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/loan", loanRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/repayment", repaymentRoutes);
// app.use('/api/config', require('./src/routes/config.routes'));
// app.use('/api/loan-products', require('./src/routes/loanProduct.routes'));
// app.use('/api/notifications', require('./src/routes/notification.routes'));


// app.get("/", (req, res) => {
//   res.send("Welcome to the Loan API!");
// });

// const PORT = process.env.PORT || 5000;

// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     require("./src/cron/paymentReminder");
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => console.error("MongoDB connection error:", err));



const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const socketAuthMiddleware = require("./src/utils/socketAuth.middleware");

dotenv.config();

const app = express(); // Only one app
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

// ✅ Attach user to socket using JWT
io.use(socketAuthMiddleware);

// ✅ Setup connection
io.on('connection', (socket) => {
  console.log("User connected:", socket.user.id);
  socket.join(socket.user.id); // Room per user

  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
});

// 🔌 Make io accessible in routes
app.set('io', io);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/loan", require("./src/routes/loan.routes"));
app.use("/api/admin", require("./src/routes/admin.routes"));
app.use("/api/repayment", require("./src/routes/repayment.routes"));
app.use('/api/config', require('./src/routes/config.routes'));
app.use('/api/loan-products', require('./src/routes/loanProduct.routes'));
app.use('/api/notifications', require('./src/routes/notification.routes'));

app.get("/", (req, res) => res.send("Welcome to the Loan API!"));

// DB + Server boot
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    require("./src/cron/paymentReminder");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
