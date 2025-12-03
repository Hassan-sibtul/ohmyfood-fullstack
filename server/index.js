require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// CORS configuration - allow all origins for testing
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Serve images from a public folder (for development)
app.use("/static", express.static(path.join(__dirname, "public")));

// Connect to MongoDB (gracefully handle missing MONGO_URI in local dev)
if (!process.env.MONGO_URI) {
  console.warn(
    "WARNING: MONGO_URI not set. The server will start, but database operations will fail. Add MONGO_URI to your .env."
  );
} else {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Mongo error", err));
}

// Routes
const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");
const userRoutes = require("./routes/users");
const recommendationRoutes = require("./routes/recommendations");
const reviewRoutes = require("./routes/reviews");

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/reviews", reviewRoutes);

// Add this route for the root URL
app.get("/", (req, res) => {
  res.send("API is running");
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log("Environment check:", {
    smtp: process.env.SMTP_HOST ? "✓" : "✗",
    frontend: process.env.FRONTEND_URL ? "✓" : "✗",
  });
});
