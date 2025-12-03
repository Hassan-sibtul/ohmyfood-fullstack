require("dotenv").config();
const mongoose = require("mongoose");
const Restaurant = require("./models/Restaurant");
const User = require("./models/User"); // 👈 add at top
const bcrypt = require("bcryptjs"); // 👈 add at top

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected, seeding...");

    // Clear old data
    await Restaurant.deleteMany({});

    // Seed restaurants
    const restaurants = [
      {
        name: "Le Gourmand",
        description: "Tasty modern French dishes",
        location: "Belleville, Paris",
        category: "Healthy",
        image: "/static/restaurants/stil-u2Lp8tXIcjw-unsplash.jpg",
        menu: [
          { name: "Croque Monsieur", description: "Ham & cheese", price: 8.5 },
          { name: "Quiche", description: "Savoury pie", price: 7.0 },
        ],
      },
      {
        name: "Enchanted Plate",
        description: "International specials",
        location: "Marais, Paris",
        category: "Healthy",
        image:
          "/static/restaurants/louis-hansel-shotsoflouis-qNBGVyOCY8Q-unsplash.jpg",
        menu: [
          {
            name: "Falafel Bowl",
            description: "Chickpea goodness",
            price: 9.5,
          },
          { name: "Seasonal Salad", description: "Fresh veg", price: 7.5 },
        ],
      },
      {
        name: "La Bastille",
        description: "Traditional Parisian bistro",
        location: "Bastille, Paris",
        category: "Healthy",
        image: "/static/restaurants/toa-heftiba-DQKerTsQwi0-unsplash.jpg",
        menu: [
          {
            name: "Onion Soup",
            description: "Classic French starter",
            price: 6.5,
          },
          {
            name: "Steak Frites",
            description: "Beef steak with fries",
            price: 14,
          },
        ],
      },
      {
        name: "Full Plate",
        description: "Generous meals and comfort food",
        location: "Montmartre, Paris",
        category: "Healthy",
        image: "/static/restaurants/jay-wennington-N_Y88TWmGwA-unsplash.jpg",
        menu: [
          {
            name: "Burger Deluxe",
            description: "Loaded burger & fries",
            price: 11,
          },
          {
            name: "Roast Chicken",
            description: "Served with vegetables",
            price: 13.5,
          },
        ],
      },
      {
        name: "Pizzaro",
        description: "Authentic Italian pizzas",
        location: "Montmartre, Paris",
        category: "Pizza",
        image: "/static/restaurants/pizza.png",
        menu: [
          {
            name: "Margherita Pizza",
            description: "Cheese & tomato",
            price: 10,
          },
          {
            name: "Pepperoni Pizza",
            description: "Spicy salami & cheese",
            price: 12,
          },
          {
            name: "Veggie Pizza",
            description: "Loaded with fresh veggies",
            price: 11,
          },
        ],
      },
      {
        name: "Burger Hub",
        description: "Juicy American-style burgers",
        location: "Bastille, Paris",
        category: "Burger",
        image: "/static/restaurants/burger.png",
        menu: [
          {
            name: "Cheeseburger",
            description: "Beef patty with cheddar",
            price: 9,
          },
          {
            name: "Double Bacon Burger",
            description: "For meat lovers",
            price: 12,
          },
          {
            name: "Veggie Burger",
            description: "Grilled veggie patty",
            price: 8,
          },
        ],
      },
      {
        name: "Sushi House",
        description: "Fresh Japanese Sushi & rolls",
        location: "Champs-Élysées, Paris",
        category: "Sushi",
        image: "/static/restaurants/sushi.png",
        menu: [
          {
            name: "Salmon Nigiri",
            description: "Fresh salmon over rice",
            price: 6,
          },
          {
            name: "California Roll",
            description: "Crab, avocado & cucumber",
            price: 7,
          },
          { name: "Veggie Maki", description: "Cucumber, avocado", price: 5 },
        ],
      },
      {
        name: "Sweet Tooth",
        description: "Cakes, pastries & Desserts",
        location: "Opera, Paris",
        category: "Dessert",
        image: "/static/restaurants/dessert.png",
        menu: [
          { name: "Chocolate Cake", description: "Rich & moist", price: 5 },
          {
            name: "Cheesecake",
            description: "Classic New York style",
            price: 5.5,
          },
          {
            name: "Macarons",
            description: "Colorful French macarons",
            price: 6,
          },
        ],
      },
    ];

    const inserted = await Restaurant.insertMany(restaurants);
    // Seed admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      name: "Restaurant Admin",
      email: "admin@restaurant.com",
      password: hashedPassword,
      isAdmin: true,
    });
    await admin.save();

    console.log("✅ Seeded restaurants and admin user:", admin.email);

    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
