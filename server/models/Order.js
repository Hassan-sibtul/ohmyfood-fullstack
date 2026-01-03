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
    ref: "Restaurant",
    required: false,
  },

  items: [
    {
      menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: false,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
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

  specialInstructions: {
    type: String,
    default: "",
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
