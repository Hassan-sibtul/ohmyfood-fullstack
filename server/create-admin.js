require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@ohmyfood.com" });
    if (existingAdmin) {
      console.log("Admin already exists!");
      console.log("Email: admin@ohmyfood.com");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin123!@#", 10);

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@ohmyfood.com",
      password: hashedPassword,
      isAdmin: true,
      loyaltyPoints: 0,
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@ohmyfood.com");
    console.log("Password: Admin123!@#");
    console.log("Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
