const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

/**
 * @route   GET /api/users/profile
 * @desc    Get logged-in user's profile
 * @access  Private
 */
router.get("/profile", auth, async (req, res) => {
  try {
    console.log("📍 GET /api/users/profile - User ID:", req.user?.id);

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.warn("❌ User not found:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile loaded for:", user.email);
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile details (address, billing, etc.)
 * @access  Private
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { address, billingDetails, name, email } = req.body;

    console.log("📝 Updating profile with:", {
      name,
      email,
      address,
      billingDetails,
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      console.warn("❌ User not found:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update only the fields provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (billingDetails) user.billingDetails = billingDetails;

    await user.save();
    console.log("✅ Profile updated successfully:", user._id);

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        loyaltyPoints: user.loyaltyPoints,
        address: user.address,
        billingDetails: user.billingDetails,
      },
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

/**
 * @route   GET /api/users/loyalty
 * @desc    Get current user's loyalty points
 * @access  Private
 */
router.get("/loyalty", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("loyaltyPoints name");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      loyaltyPoints: user.loyaltyPoints,
    });
  } catch (err) {
    console.error("❌ Error fetching loyalty points:", err.message);
    res.status(500).json({ error: "Failed to fetch loyalty points" });
  }
});

/**
 * @route   PUT /api/users/redeem
 * @desc    Redeem loyalty points (deduct from user)
 * @access  Private
 */
router.put("/redeem", auth, async (req, res) => {
  try {
    const { pointsToRedeem } = req.body;
    if (!pointsToRedeem || pointsToRedeem <= 0)
      return res.status(400).json({ message: "Invalid points value" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.loyaltyPoints < pointsToRedeem)
      return res.status(400).json({ message: "Not enough points" });

    user.loyaltyPoints -= pointsToRedeem;
    await user.save();

    console.log(`💎 Redeemed ${pointsToRedeem} points from user ${user.email}`);

    res.json({
      message: `Redeemed ${pointsToRedeem} points.`,
      remainingPoints: user.loyaltyPoints,
    });
  } catch (err) {
    console.error("❌ Error redeeming points:", err.message);
    res.status(500).json({ error: "Failed to redeem points" });
  }
});

module.exports = router;
