const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User");

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email sending function
async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("[DEV] Email send simulated:", { to, subject, text, html });
    return { messageId: "dev-simulated" };
  }

  const msg = {
    to,
    from: process.env.FROM_EMAIL || "no-reply@ohmyfood.local",
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully to:", to);
    return { messageId: "sent" };
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error);
    throw error;
  }
}

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      loyaltyPoints: 0,
    });

    // Create JWT (include email and isAdmin for middleware/UI)
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    // Return both token and user
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login existing user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT (include email and isAdmin for middleware/UI)
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        loyaltyPoints: user.loyaltyPoints,
        address: user.address,
        billingDetails: user.billingDetails,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Forgot Password - request reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const genericMsg = {
      message:
        "If an account exists for this email, a reset link has been sent.",
    };

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Privacy-preserving response
      return res.json(genericMsg);
    }

    // Generate token and store hashed token + expiry
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetToken = hashed;
    user.resetTokenExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontend}/reset-password/${rawToken}`;

    // Send email using SendGrid HTTP API
    await sendEmail({
      to: email,
      subject: "OhMyFood Password Reset",
      html: `
        <p>You requested a password reset for your OhMyFood account.</p>
        <p>Click the link below to set a new password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
      text: `Reset your password: ${resetUrl}`,
    });

    res.json(genericMsg);
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Failed to process password reset" });
  }
});

// Reset Password - set new password using token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res
        .status(400)
        .json({ message: "Token and new password are required" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashed,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;
