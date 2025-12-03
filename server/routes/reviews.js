// server/routes/reviews.js
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

// Submit a review for a dish
router.post("/", auth, async (req, res) => {
  try {
    const { restaurantId, dishName, rating, comment, orderId } = req.body;

    if (!restaurantId || !dishName || !rating) {
      return res
        .status(400)
        .json({ error: "restaurantId, dishName, and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Optional: verify the order belongs to the user and is delivered
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order || order.user.toString() !== req.user.id) {
        return res.status(403).json({ error: "Invalid order" });
      }
    }

    // Create or update review
    const review = await Review.findOneAndUpdate(
      {
        user: req.user.id,
        restaurant: restaurantId,
        dishName,
        order: orderId || null,
      },
      {
        rating,
        comment: comment || "",
      },
      { upsert: true, new: true }
    );

    res.status(201).json(savedReview);
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// Get all reviews for a restaurant (with dish-level aggregation)
router.get("/restaurant/:id", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Aggregate ratings per dish
    const dishRatings = {};
    reviews.forEach((review) => {
      if (!dishRatings[review.dishName]) {
        dishRatings[review.dishName] = { total: 0, count: 0, reviews: [] };
      }
      dishRatings[review.dishName].total += review.rating;
      dishRatings[review.dishName].count += 1;
      dishRatings[review.dishName].reviews.push({
        rating: review.rating,
        comment: review.comment,
        userName: review.user?.name || "Anonymous",
        createdAt: review.createdAt,
      });
    });

    // Calculate averages
    const dishStats = {};
    Object.keys(dishRatings).forEach((dishName) => {
      const data = dishRatings[dishName];
      dishStats[dishName] = {
        averageRating: (data.total / data.count).toFixed(1),
        reviewCount: data.count,
        reviews: data.reviews,
      };
    });

    res.json({ reviews, dishStats });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Get user's own reviews
router.get("/my-reviews", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
});

module.exports = router;
