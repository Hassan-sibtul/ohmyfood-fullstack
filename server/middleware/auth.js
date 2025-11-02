const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false,
    };

    // Debugging (optional, you can remove later)
    console.log("✅ Authenticated user:", req.user);

    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
