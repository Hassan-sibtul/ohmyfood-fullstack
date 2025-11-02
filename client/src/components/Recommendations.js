import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import { CartContext } from "../context/CartContext";

export default function Recommendations({ restaurantId, currentMenu = [] }) {
  const [items, setItems] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!restaurantId || !token) return;

    API.get(`/api/recommendations/${restaurantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const recommended = res.data || [];

        // ✅ Filter out duplicates already in the restaurant menu
        const filtered = recommended.filter(
          (rec) =>
            !currentMenu.some(
              (menuItem) =>
                menuItem.name.trim().toLowerCase() ===
                rec.name.trim().toLowerCase()
            )
        );

        setItems(filtered);
      })
      .catch((err) =>
        console.error("❌ Recommendation fetch error:", err.message)
      );
  }, [restaurantId, currentMenu]);

  if (!items.length) return null; // hide section completely if empty

  return (
    <section
      className="recommendations"
      style={{
        marginTop: "40px",
        padding: "0 20px",
      }}
    >
      <h3
        style={{
          marginBottom: "15px",
          fontSize: "1.2em",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🍽️ You might also like
      </h3>

      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {items.map((item) => (
          <div
            key={item._id || item.name}
            style={{
              minWidth: "180px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              padding: "12px",
              flexShrink: 0,
              transition: "transform 0.2s ease",
            }}
            className="recommendation-card"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <h4 style={{ marginBottom: "4px", fontSize: "1em" }}>
              {item.name}
            </h4>
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "0.85em",
                color: "#666",
              }}
            >
              {item.description}
            </p>
            <p
              style={{
                fontWeight: "bold",
                color: "#ff385c",
                fontSize: "0.95em",
              }}
            >
              £{item.price.toFixed(2)}
            </p>
            <button
              onClick={() => addToCart({ ...item, restaurantId })}
              style={{
                marginTop: "8px",
                width: "100%",
                border: "none",
                borderRadius: "6px",
                background: "#ff385c",
                color: "#fff",
                padding: "6px 0",
                cursor: "pointer",
                fontSize: "0.85em",
              }}
            >
              + Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
