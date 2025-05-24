const jwt = require("jsonwebtoken");

const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id }; // Match your `req.user._id` usage
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
};

module.exports = socketAuthMiddleware;
