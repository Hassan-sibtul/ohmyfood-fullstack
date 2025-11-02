require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve images from a public folder (for development)
app.use("/static", express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error", err));

// Routes
const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");
const userRoutes = require("./routes/users");
const recommendationRoutes = require("./routes/recommendations");

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Add this route for the root URL
app.get("/", (req, res) => {
  res.send("API is running");
});

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on port ${port}`));
