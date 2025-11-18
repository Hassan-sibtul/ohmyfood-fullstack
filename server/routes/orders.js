const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Order");
const User = require("../models/User");
const auth = require("../middleware/auth");

// ✅ Create a new order after successful payment
router.post("/", auth, async (req, res) => {
  try {
    const { items, totalAmount, address, restaurantId, specialInstructions } = req.body;

    if (!items || !totalAmount || !address) {
      return res
        .status(400)
        .json({ error: "Items, totalAmount, and address are required." });
    }

    // Debug log (only in dev)
    if (process.env.NODE_ENV !== "production") {
      console.log("📥 POST /api/orders payload:", {
        restaurantId,
        itemsSample: items && items.length ? items[0] : null,
        totalAmount,
      });
    }

    // Derive restaurantId from payload or first item
    const derivedRestaurantId =
      restaurantId ||
      items?.[0]?.restaurantId ||
      items?.[0]?.restaurant?._id ||
      items?.[0]?.restaurant ||
      null;

    const restaurantObjectId = derivedRestaurantId
      ? new mongoose.Types.ObjectId(derivedRestaurantId)
      : null;

    // ✅ Create new order document
    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(req.user.id),
      restaurant: restaurantObjectId,
      items,
      totalAmount,
      address: {
        street: address.street,
        postcode: address.postcode,
        county: address.county,
        country: address.country,
      },
      status: "Paid",
      specialInstructions: specialInstructions || "",
    });

    await newOrder.save();

    // ✅ Add loyalty points: 1 point per £1 spent
    try {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { loyaltyPoints: Math.floor(totalAmount) },
      });
    } catch (err) {
      console.warn("⚠️ Failed to update loyalty points:", err.message);
    }

    // ✅ Populate before returning
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("user", "name email")
      .populate("restaurant", "name");

    console.log("✅ Order saved:", populatedOrder);
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Get all orders of the logged-in user (Customer)
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Admin: Get ALL customer orders
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
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Admin: Update order status
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
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

module.exports = router;
