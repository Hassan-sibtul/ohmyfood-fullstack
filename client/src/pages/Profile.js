// client/src/pages/Profile.js
import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // ✅ Fetch user's profile and orders
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchData() {
      try {
        const [userRes, ordersRes] = await Promise.all([
          API.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/api/orders/my-orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUser(userRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error("❌ Error fetching profile/orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ✅ Handle reordering a past order
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;

    const confirmReorder = window.confirm(
      `Reorder ${order.items.length} item(s) from your past order?`
    );
    if (!confirmReorder) return;

    clearCart(); // optional: clear existing cart

    order.items.forEach((item) => {
      addToCart({
        ...item,
        restaurantId: order.restaurant?._id || order.restaurantId || null,
        qty: item.qty || 1,
      });
    });

    navigate("/cart");
  };

  if (loading) {
    return <p className="loading-text">Loading your profile...</p>;
  }

  return (
    <div
      className="profile-page"
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "20px",
        background: "#fafafa",
        borderRadius: "10px",
      }}
    >
      <h2 className="page-title" style={{ marginBottom: "20px" }}>
        My Profile
      </h2>

      {user && (
        <div
          className="profile-info"
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
            background: "#fff",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>{user.name}</h3>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Loyalty Points:</strong> {user.loyaltyPoints || 0}
          </p>

          {user.address && (
            <>
              <h4 style={{ marginTop: "15px" }}>Saved Address</h4>
              <p>{user.address.street}</p>
              <p>
                {user.address.postcode}, {user.address.county}
              </p>
              <p>{user.address.country}</p>
            </>
          )}
        </div>
      )}

      <h2 className="page-title">My Orders</h2>

      {orders.length === 0 ? (
        <p className="empty-text">You haven’t placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order._id}
              className="order-card"
              style={{
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#fff",
              }}
            >
              <div className="order-header">
                <h4 className="order-id">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h4>
                <span
                  className={`order-status ${
                    order.status === "Paid" ? "status-paid" : "status-pending"
                  }`}
                  style={{
                    background: order.status === "Paid" ? "#28a745" : "#ff9800",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.85em",
                  }}
                >
                  {order.status}
                </span>
              </div>

              <p
                className="restaurant-name"
                style={{
                  color: "#666",
                  margin: "10px 0",
                  fontSize: "0.95em",
                }}
              >
                <strong>Restaurant:</strong>{" "}
                {order.restaurant?.name || "Unknown"}
              </p>

              <p className="order-total">
                <strong>Total:</strong> £{order.totalAmount.toFixed(2)}
              </p>
              <p className="order-date">
                <strong>Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>

              <div className="order-items">
                <strong>Items:</strong>
                <ul>
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.qty} — £
                      {(item.price * item.qty).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-address">
                <strong>Delivery Address:</strong>
                <p>{order.address?.street}</p>
                <p>
                  {order.address?.postcode}, {order.address?.county}
                </p>
                <p>{order.address?.country}</p>
              </div>

              {/* ✅ Reorder Button */}
              <button
                onClick={() => handleReorder(order)}
                className="reorder-btn"
                style={{
                  marginTop: "10px",
                  background: "#ff385c",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Reorder
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
