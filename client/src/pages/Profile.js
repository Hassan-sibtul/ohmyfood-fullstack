// client/src/pages/Profile.js
import React, { useEffect, useState, useContext, useRef } from "react";
import API from "../api";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import DeliveryTracker from "../components/DeliveryTracker";
import Toast from "../components/Toast";
import ReviewModal from "../components/ReviewModal";

// Small helper to color status badges consistently
const statusBg = (status) => {
  switch (status) {
    case "Paid":
      return "#17a2b8"; // teal
    case "Preparing":
      return "#ff9800"; // orange
    case "Out for Delivery":
      return "#007bff"; // blue
    case "Delivered":
      return "#28a745"; // green
    default:
      return "#6c757d"; // gray
  }
};

// Status-specific emoji for toast
const statusEmoji = (status) => {
  switch (status) {
    case "Paid":
      return "💳";
    case "Preparing":
      return "👨‍🍳";
    case "Out for Delivery":
      return "🚚";
    case "Delivered":
      return "✅";
    default:
      return "📦";
  }
};

export default function Profile() {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [reviewModal, setReviewModal] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const previousOrdersRef = useRef({});

  // Play subtle notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      // Silent fail if audio not supported
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const res = await API.get("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newOrders = Array.isArray(res.data) ? res.data : [];

      // Check for status changes
      newOrders.forEach((order) => {
        const prevStatus = previousOrdersRef.current[order._id];
        if (prevStatus && prevStatus !== order.status) {
          // Status changed!
          setToastMessage(
            `${statusEmoji(order.status)} Your order is now ${order.status}!`
          );
          setToastVisible(true);
          playNotificationSound();
        }
        previousOrdersRef.current[order._id] = order.status;
      });

      setOrders(newOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTracker = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Re-adds items from a past order to the cart
  const handleReorder = (order) => {
    const restaurantId = order?.restaurant?._id || order?.restaurant || null;
    order.items.forEach((item) => {
      // Synthetic _id for cart uniqueness when order items don't have _id
      const syntheticId = `${restaurantId || "unknown"}:${item.name}`;
      addToCart(
        {
          _id: syntheticId,
          name: item.name,
          price: item.price,
          qty: item.qty || 1,
          restaurantId,
        },
        restaurantId
      );
    });
    navigate("/cart");
  };

  // Submit review
  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem("token");
      await API.post("/api/reviews", reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToastMessage("✅ Review submitted successfully!");
      setToastVisible(true);
    } catch (err) {
      console.error("Failed to submit review:", err);
      throw err;
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "Delivered");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2 style={{ margin: 0 }}>My Orders</h2>
        <p style={{ color: "#666" }}>Loading your orders…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      {reviewModal && (
        <ReviewModal
          dish={reviewModal.dish}
          restaurantId={reviewModal.restaurantId}
          orderId={reviewModal.orderId}
          onClose={() => setReviewModal(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      <h2 className="page-title">My Orders</h2>

      {orders.length === 0 ? (
        <p className="empty-text">You haven’t placed any orders yet.</p>
      ) : (
        <>
          {/* Active Orders */}
          <section style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>🟣 Active Orders</h3>
              <span style={{ color: "#666" }}>
                {activeOrders.length} active
              </span>
            </div>

            <div className="orders-list">
              {activeOrders.length === 0 ? (
                <p style={{ color: "#777", margin: 0 }}>No active orders.</p>
              ) : (
                activeOrders.map((order) => (
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
                    <div
                      className="order-header"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <h4 className="order-id" style={{ margin: 0 }}>
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h4>
                      <span
                        className="order-status"
                        style={{
                          background: statusBg(order.status),
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

                    {/* Actions for active orders */}
                    <div style={{ marginTop: 10 }}>
                      <button
                        onClick={() => handleReorder(order)}
                        className="reorder-btn"
                        style={{
                          background: "#ff385c",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          marginRight: 10,
                        }}
                      >
                        🔄 Reorder
                      </button>

                      <button
                        onClick={() => toggleTracker(order._id)}
                        style={{
                          background: expandedOrders[order._id]
                            ? "#6c757d"
                            : "#007bff",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          marginRight: 10,
                        }}
                      >
                        {expandedOrders[order._id]
                          ? "🔼 Hide Tracker"
                          : "📍 Track Delivery"}
                      </button>

                      <button
                        onClick={() =>
                          navigate("/track-order", { state: { order } })
                        }
                        style={{
                          background: "#28a745",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        🗺️ Full Tracking
                      </button>
                    </div>

                    {expandedOrders[order._id] && (
                      <DeliveryTracker key={order.status} order={order} />
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Delivered Orders */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>🟢 Delivered Orders</h3>
              <span style={{ color: "#666" }}>
                {deliveredOrders.length} delivered
              </span>
            </div>

            <div className="orders-list">
              {deliveredOrders.length === 0 ? (
                <p style={{ color: "#777", margin: 0 }}>
                  No delivered orders yet.
                </p>
              ) : (
                deliveredOrders.map((order) => (
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
                    <div
                      className="order-header"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <h4 className="order-id" style={{ margin: 0 }}>
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h4>
                      <span
                        className="order-status"
                        style={{
                          background: statusBg(order.status),
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
                          <li
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "4px 0",
                            }}
                          >
                            <span>
                              {item.name} × {item.qty} — £
                              {(item.price * item.qty).toFixed(2)}
                            </span>
                            <button
                              onClick={() =>
                                setReviewModal({
                                  dish: item,
                                  restaurantId:
                                    order.restaurant?._id || order.restaurant,
                                  orderId: order._id,
                                })
                              }
                              style={{
                                background: "transparent",
                                border: "1px solid #ffc107",
                                color: "#ffc107",
                                padding: "4px 10px",
                                borderRadius: 4,
                                fontSize: "0.8rem",
                                cursor: "pointer",
                              }}
                            >
                              ⭐ Rate
                            </button>
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

                    {/* Only Reorder for delivered orders */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="reorder-btn"
                      style={{
                        marginTop: 10,
                        background: "#ff385c",
                        color: "#fff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      🔄 Reorder
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
