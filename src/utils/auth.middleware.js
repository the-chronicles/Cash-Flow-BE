const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1];

  

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify the token using the secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    req.user = decoded;
    // req.user = { _id: decoded.id }; // ✅ now req.user._id works


    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle invalid or expired token
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
