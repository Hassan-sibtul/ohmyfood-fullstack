const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Order");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Create a new order after successful payment
router.post("/", auth, async (req, res) => {
  try {
    const { items, totalAmount, address, restaurantId, specialInstructions } =
      req.body;

    console.log("--- START of POST /api/orders ---");

    if (!items || !totalAmount || !address) {
      console.error("Validation failed: Missing items, totalAmount, or address.");
      return res
        .status(400)
        .json({ error: "Items, totalAmount, and address are required." });
    }

    if (!req.user || !req.user.id) {
        console.error("CRITICAL: User not authenticated correctly, req.user.id is missing even after auth middleware.");
        return res.status(401).json({ error: "User authentication failed." });
    }

    // --- Enhanced Debugging ---
    console.log("User ID from token:", req.user.id);
    console.log("Is user ID a string?", typeof req.user.id === 'string');

    const derivedRestaurantId =
      restaurantId ||
      items?.[0]?.restaurantId ||
      items?.[0]?.restaurant?._id ||
      items?.[0]?.restaurant ||
      null;

    const orderData = {
      user: req.user.id,
      restaurant: derivedRestaurantId ? new mongoose.Types.ObjectId(derivedRestaurantId) : null,
      items,
      totalAmount,
      address,
      status: "Paid",
      specialInstructions: specialInstructions || "",
    };

    console.log("Order data BEFORE creating model instance:", orderData);
    // --- End Enhanced Debugging ---

    const newOrder = new Order(orderData);
    
    console.log("Mongoose model instance BEFORE save:", newOrder);

    // Using a try-catch specifically for the save operation
    let savedOrder;
    try {
        savedOrder = await newOrder.save();
        console.log("Document AFTER save (pre-population):", savedOrder);
    } catch (saveError) {
        console.error("!!! ERROR during newOrder.save() !!!", saveError);
        if (saveError.name === 'ValidationError') {
            console.error("Validation Errors:", saveError.errors);
        }
        return res.status(500).json({ error: "Failed to save the order.", details: saveError.message });
    }

    // Add loyalty points
    try {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { loyaltyPoints: Math.floor(totalAmount) },
      });
    } catch (err) {
      console.warn("Could not update loyalty points:", err.message);
    }

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("user", "name email")
      .populate("restaurant", "name");

    console.log("Final populated order to be sent to client:", populatedOrder);
    console.log("--- END of POST /api/orders ---");

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("!!! Uncaught error in POST /api/orders handler !!!", err);
    res.status(500).json({ error: "An unexpected error occurred while creating the order." });
  }
});

// Get all orders of the logged-in user (Customer)
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Admin: Get ALL customer orders
router.get("/", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admins only" });
    }

    const orders = await Order.find({})
      .populate("user", "name email loyaltyPoints")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Admin: Update order status
router.put("/:id/status", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admins only" });
    }

    const validStatuses = [
      "Paid",
      "Preparing",
      "Out for Delivery",
      "Delivered",
    ];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
      .populate("user", "name email")
      .populate("restaurant", "name")
      .select("-__v");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

module.exports = router;