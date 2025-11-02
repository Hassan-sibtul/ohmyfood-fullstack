const mongoose = require("mongoose");

const MenuItem = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
});

const restaurantSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    location: String,
    category: String,
    image: String,
    menu: [MenuItem],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
