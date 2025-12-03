const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const auth = require("../middleware/auth");

// GET /api/recommendations/:restaurantId
// Returns recommended items for the logged-in user in the same restaurant
router.get("/:restaurantId", auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log("Getting recommendations for:", restaurantId);

    // Step 1: Get all user's past orders
    const pastOrders = await Order.find({ user: req.user.id }).lean();
    console.log("Past orders found:", pastOrders.length);

    if (!pastOrders.length) {
      console.log("No past orders found for user");
      return res.json([]); // no history = no recommendations
    }

    // Step 2: Flatten all ordered items
    const allItems = pastOrders.flatMap((o) => o.items || []);
    console.log("Total ordered items:", allItems.length);

    // Step 3: Count item frequency
    const frequency = {};
    allItems.forEach((item) => {
      const key = item.name.toLowerCase();
      frequency[key] = (frequency[key] || 0) + 1;
    });

    const topItems = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => name);

    console.log("Top ordered items:", topItems);

    // Step 4: Get restaurant's menu
    const restaurant = await Restaurant.findById(restaurantId).lean();
    console.log("Restaurant menu items:", restaurant?.menu?.length || 0);

    if (!restaurant?.menu) {
      console.log("No menu found for restaurant");
      return res.json([]);
    }

    // Step 5: Match by category / price / name similarity
    const recommendations = restaurant.menu.filter((menuItem) => {
      // Match by category similarity if present
      if (menuItem.category) {
        const menuItemCategories = menuItem.category
          .toLowerCase()
          .split(",")
          .map((c) => c.trim());

        const hasSimilarCategory = allItems.some(
          (orderedItem) =>
            orderedItem.category &&
            menuItemCategories.some((cat) =>
              orderedItem.category.toLowerCase().includes(cat)
            )
        );
        if (hasSimilarCategory) return true;
      }

      // Match by price similarity (±20%)
      const hasSimilarPrice = allItems.some((orderedItem) => {
        const priceDiff = Math.abs(orderedItem.price - menuItem.price);
        const threshold = orderedItem.price * 0.2;
        return priceDiff <= threshold;
      });
      if (hasSimilarPrice) return true;

      // Match by partial name similarity
      const lowerName = menuItem.name.toLowerCase();
      return topItems.some(
        (fav) =>
          lowerName.includes(fav.split(" ")[0]) ||
          fav
            .split(" ")
            .some(
              (word) =>
                word.length > 3 && lowerName.includes(word.toLowerCase())
            )
      );
    });

    console.log("Initial recommendations:", recommendations.length);

    // Step 6: Exclude recently ordered items
    const recentOrderItems = pastOrders
      .slice(0, 3)
      .flatMap((o) => o.items || [])
      .map((i) => i.name.toLowerCase());

    const filtered = recommendations.filter(
      (r) => !recentOrderItems.includes(r.name.toLowerCase())
    );

    console.log("Final filtered recommendations:", filtered.length);

    // Step 7: Return only the found recommendations
    res.json(filtered);
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ error: "Failed to load recommendations" });
  }
});

module.exports = router;
