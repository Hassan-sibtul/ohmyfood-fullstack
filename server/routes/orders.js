const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Order");
const User = require("../models/User");
const auth = require("../middleware/auth");

/**
 * @description Create one or more orders from a single cart payload.
 * The payload can contain items from multiple restaurants.
 * This endpoint will automatically split them into separate orders.
 */
router.post("/", auth, async (req, res) => {
  try {
    const { items, address, specialInstructions } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User authentication failed." });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items are required." });
    }
    if (!address) {
      return res.status(400).json({ error: "Delivery address is required." });
    }

    // --- Group items by restaurantId ---
    const ordersByRestaurant = items.reduce((acc, item) => {
      const restaurantId = item.restaurantId || item.restaurant;
      if (!restaurantId) return acc;

      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          items: [],
          totalAmount: 0,
        };
      }
      acc[restaurantId].items.push(item);
      acc[restaurantId].totalAmount += item.price * item.quantity;
      return acc;
    }, {});

    const createdOrders = [];
    const orderPromises = [];

    // --- Create a separate order for each restaurant ---
    for (const restaurantId in ordersByRestaurant) {
      const orderData = ordersByRestaurant[restaurantId];

      const newOrder = new Order({
        user: req.user.id,
        restaurant: new mongoose.Types.ObjectId(restaurantId),
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        address: address,
        status: "Paid",
        specialInstructions: specialInstructions || "",
      });

      orderPromises.push(newOrder.save());
    }

    // --- Wait for all orders to be saved ---
    const savedOrders = await Promise.all(orderPromises);

    // --- Populate user and restaurant details for the response ---
    for (const order of savedOrders) {
        const populatedOrder = await Order.findById(order._id)
            .populate("user", "name email")
            .populate("restaurant", "name");
        createdOrders.push(populatedOrder);
    }

    // --- Update user's loyalty points based on the grand total ---
    const grandTotal = savedOrders.reduce((total, order) => total + order.totalAmount, 0);
    if (grandTotal > 0) {
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { loyaltyPoints: Math.floor(grandTotal) },
        });
    }

    console.log(`${createdOrders.length} orders created from a single cart.`);
    res.status(201).json(createdOrders); // Return an array of the created orders

  } catch (err) {
    console.error("Error creating split orders:", err);
    res.status(500).json({ error: "Failed to create one or more orders." });
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
    const validStatuses = ["Paid", "Preparing", "Out for Delivery", "Delivered"];
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