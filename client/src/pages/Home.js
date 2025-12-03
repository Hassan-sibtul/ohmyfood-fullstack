import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategories, setActiveCategories] = useState([]); // now an array

  const toggleCategory = (cat) => {
    if (cat === "All") {
      setActiveCategories([]);
    } else {
      setActiveCategories((prev) =>
        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      );
    }
  };

  const categories = ["All", "Pizza", "Burger", "Sushi", "Healthy", "Dessert"];

  useEffect(() => {
    API.get("/api/restaurants")
      .then((res) => {
        setRestaurants(res.data);
        setFiltered(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let result = [...restaurants];

    if (query) {
      result = result.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (activeCategories.length > 0) {
      result = result.filter((r) => activeCategories.includes(r.category));
    }

    setFiltered(result);
  }, [query, activeCategories, restaurants]);

  const handleBrowseClick = () => {
    setShowSearch(true);
    document
      .getElementById("restaurants")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>Delicious food, delivered fast</h1>
        <p>Choose your favorite restaurant and enjoy fresh meals at home.</p>
        <button onClick={handleBrowseClick} className="hero-btn">
          Browse Restaurants
        </button>
      </section>

      {/* Restaurants Section */}
      <section id="restaurants" className="restaurants-section">
        <h2>Restaurants</h2>

        {showSearch && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-bar"
            />
          </div>
        )}

        {/* Categories Filter */}
        <div className="category-grid">
          {categories.map((cat) => (
            <button
              key={cat}
              className={
                activeCategories.includes(cat) ? "active-category" : ""
              }
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Restaurant Grid */}
        <div className="restaurant-grid">
          {filtered.map((rest) => (
            <div className="restaurant-card" key={rest._id}>
              <img
                src={`${
                  process.env.REACT_APP_API_URL || "http://localhost:5001"
                }${rest.image}`}
                alt={rest.name}
              />
              <h3>{rest.name}</h3>
              <p>{rest.description}</p>

              <Link to={`/restaurants/${rest._id}`} className="view-menu">
                View Menu
              </Link>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: "center" }}>No restaurants found.</p>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step-card">🍴 Browse restaurants</div>
          <div className="step-card">🛒 Add meals to cart</div>
          <div className="step-card">🚀 Get delivery</div>
        </div>
      </section>
    </div>
  );
}
