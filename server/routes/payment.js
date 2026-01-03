const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const auth = require("../middleware/auth");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body; // amount in cents
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "gbp", // change currency if needed
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

module.exports = router;
