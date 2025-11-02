// server/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant", // 👈 reference Restaurant model
    required: false, // optional: set to true if every order must have a restaurant
  },
  items: [
    {
      name: String,
      price: Number,
      qty: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  address: {
    street: { type: String, required: true },
    postcode: { type: String, required: true },
    county: { type: String, required: true },
    country: { type: String, required: true },
  },
  status: {
    type: String,
    default: "Paid",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
