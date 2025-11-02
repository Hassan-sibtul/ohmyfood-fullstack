const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpire: Date,

  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  isAdmin: { type: Boolean, default: false },

  address: {
    street: String,
    postcode: String,
    county: String,
    country: String,
  },
  billingDetails: {
    name: String,
    email: String,
    line1: String,
    city: String,
    country: String,
  },
});

module.exports = mongoose.model("User", userSchema);
