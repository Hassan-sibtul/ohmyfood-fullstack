const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Expects "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Token is missing from header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Directly attach the decoded payload to the request object.
    // This payload should contain the user's id, email, and isAdmin status.
    req.user = decoded;

    // Optional: Log to verify the user's details on your server
    console.log("Authenticated user from token:", req.user);

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};