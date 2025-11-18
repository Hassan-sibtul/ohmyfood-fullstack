// client/src/pages/Restaurant.js
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import { CartContext } from "../context/CartContext";

export default function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rest, setRest] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [previouslyOrdered, setPreviouslyOrdered] = useState([]);
  const [dishRatings, setDishRatings] = useState({});
  const [toast, setToast] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const { addToCart } = useContext(CartContext);

  // ✅ Fetch restaurant details
  useEffect(() => {
    API.get(`/api/restaurants/${id}`)
      .then((r) => setRest(r.data))
      .catch(console.error);
  }, [id]);

  // ✅ Fetch reviews and ratings for this restaurant
  useEffect(() => {
    if (!id) return;
    API.get(`/api/reviews/restaurant/${id}`)
      .then((res) => {
        setDishRatings(res.data.dishStats || {});
      })
      .catch((err) => console.error("❌ Error fetching reviews:", err));
  }, [id]);

  // ✅ Fetch recommendations
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!id || !token) return;

    API.get(`/api/recommendations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setRecommended(res.data || []))
      .catch((err) =>
        console.error("❌ Error fetching recommendations:", err.message)
      );
  }, [id]);

  // ✅ Fetch user's past orders to show "Order Again" labels
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/api/orders/my-orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const allItems = res.data.flatMap((order) => order.items || []);
        const names = allItems.map((i) => i.name.trim().toLowerCase());
        setPreviouslyOrdered([...new Set(names)]); // unique names
      })
      .catch((err) => console.error("❌ Failed to load user orders:", err));
  }, []);

  // ✅ Add item to cart
  function handleAdd(item) {
    addToCart({ ...item, restaurantId: rest._id });
    setToast(`${item.name} added to cart ✅`);
    setTimeout(() => setToast(null), 2000);
  }

  if (!rest) return <div>Loading...</div>;

  // ✅ Helpers
  const isRecommended = (item) =>
    recommended.some(
      (r) => r.name.trim().toLowerCase() === item.name.trim().toLowerCase()
    );

  const isPreviouslyOrdered = (item) =>
    previouslyOrdered.includes(item.name.trim().toLowerCase());

  return (
    <div className="restaurant-page">
      {toast && (
        <div
          className="toast"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#ff385c",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            zIndex: 999,
          }}
        >
          {toast}
        </div>
      )}

      <div className="restaurant-header">
        <img
          src={`${process.env.REACT_APP_API_URL || "http://localhost:5001"}${
            rest.image
          }`}
          alt={rest.name}
          className="restaurant-banner"
        />
        <div className="restaurant-info">
          <h1>{rest.name}</h1>
          <p>{rest.description}</p>
        </div>
      </div>

      {/* ✅ Menu Grid */}
      <div
        className="menu-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          padding: "20px",
        }}
      >
        {rest.menu.map((m) => (
          <div
            key={m._id || m.name}
            className="menu-card"
            style={{
              position: "relative",
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              transition: "transform 0.2s ease",
            }}
          >
            {/* ✅ Badge container (top-right) */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
              }}
            >
              {isRecommended(m) && (
                <span
                  style={{
                    background: "#ff385c",
                    color: "#fff",
                    fontSize: "0.75em",
                    fontWeight: "bold",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  ⭐ Recommended
                </span>
              )}

              {isPreviouslyOrdered(m) && (
                <span
                  style={{
                    background: "#f5b400",
                    color: "#000",
                    fontSize: "0.75em",
                    fontWeight: "bold",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  🛍️ Order Again
                </span>
              )}
            </div>

            <h4 style={{ marginBottom: "6px" }}>{m.name}</h4>

            {/* ✅ Display rating if available */}
            {dishRatings[m.name] && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setExpandedReviews((prev) => ({
                      ...prev,
                      [m.name]: !prev[m.name],
                    }))
                  }
                >
                  <span style={{ color: "#ffc107", fontSize: "1em" }}>★</span>
                  <span style={{ fontWeight: "bold", fontSize: "0.9em" }}>
                    {dishRatings[m.name].averageRating}
                  </span>
                  <span style={{ color: "#999", fontSize: "0.85em" }}>
                    ({dishRatings[m.name].reviewCount}{" "}
                    {dishRatings[m.name].reviewCount === 1
                      ? "review"
                      : "reviews"}
                    )
                  </span>
                  <span style={{ fontSize: "0.8em", color: "#666" }}>
                    {expandedReviews[m.name] ? "▲" : "▼"}
                  </span>
                </div>

                {/* Show reviews when expanded */}
                {expandedReviews[m.name] && (
                  <div
                    style={{
                      background: "#f9f9f9",
                      border: "1px solid #eee",
                      borderRadius: "6px",
                      padding: "10px",
                      marginBottom: "8px",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {dishRatings[m.name].reviews
                      .slice(0, 5)
                      .map((review, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderBottom:
                              idx <
                              Math.min(
                                4,
                                dishRatings[m.name].reviews.length - 1
                              )
                                ? "1px solid #ddd"
                                : "none",
                            paddingBottom: "6px",
                            marginBottom: "6px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginBottom: "2px",
                            }}
                          >
                            <span
                              style={{ color: "#ffc107", fontSize: "0.85em" }}
                            >
                              {"★".repeat(review.rating)}
                              {"☆".repeat(5 - review.rating)}
                            </span>
                            <span style={{ fontSize: "0.75em", color: "#666" }}>
                              {review.userName}
                            </span>
                          </div>
                          {review.comment && (
                            <p
                              style={{
                                fontSize: "0.85em",
                                color: "#555",
                                margin: "4px 0 0 0",
                              }}
                            >
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    {dishRatings[m.name].reviews.length > 5 && (
                      <p
                        style={{
                          fontSize: "0.8em",
                          color: "#999",
                          margin: "4px 0 0 0",
                          textAlign: "center",
                        }}
                      >
                        + {dishRatings[m.name].reviews.length - 5} more reviews
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <p
              style={{
                color: "#666",
                fontSize: "0.9em",
                minHeight: "40px",
              }}
            >
              {m.description}
            </p>
            <p
              style={{
                fontWeight: "bold",
                marginTop: "8px",
                color: "#000",
              }}
            >
              £{m.price.toFixed(2)}
            </p>

            <button
              onClick={() => handleAdd(m)}
              className="add-btn"
              style={{
                width: "100%",
                background: "#ff385c",
                color: "#fff",
                border: "none",
                padding: "10px 0",
                borderRadius: "6px",
                marginTop: "10px",
                cursor: "pointer",
                fontSize: "0.9em",
              }}
            >
              ➕ Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer
        className="restaurant-footer"
        style={{ textAlign: "center", marginTop: "30px" }}
      >
        <button
          className="btn-secondary"
          onClick={() => navigate("/")}
          style={{
            background: "#f1f1f1",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          🍴 Choose More Items
        </button>
      </footer>
    </div>
  );
}
