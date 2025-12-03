import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DeliveryTracker from "../components/DeliveryTracker";
import Toast from "../components/Toast";
import API from "../api";

// Status-specific prefix for toast
const statusEmoji = (status) => {
  switch (status) {
    case "Paid":
      return "[Paid]";
    case "Preparing":
      return "[Preparing]";
    case "Out for Delivery":
      return "[Delivery]";
    case "Delivered":
      return "[Complete]";
    default:
      return "[Order]";
  }
};

export default function TrackOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const initialOrder = location.state?.order;

  const [order, setOrder] = useState(initialOrder);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const previousStatusRef = useRef(initialOrder?.status);

  // If order ID in URL but no state, fetch it
  useEffect(() => {
    if (id && !order) {
      const token = localStorage.getItem("token");
      if (!token) return;

      API.get("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          const foundOrder = res.data.find((o) => o._id === id);
          if (foundOrder) {
            setOrder(foundOrder);
            previousStatusRef.current = foundOrder.status;
          }
        })
        .catch((err) => console.error("Failed to fetch order:", err));
    }
  }, [id, order]);

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

  // Poll for order updates every 5 seconds
  useEffect(() => {
    if (!order?._id) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const interval = setInterval(() => {
      API.get("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          const updatedOrder = res.data.find((o) => o._id === order._id);
          if (updatedOrder) {
            // Check for status change
            if (
              previousStatusRef.current &&
              previousStatusRef.current !== updatedOrder.status
            ) {
              setToastMessage(
                `${statusEmoji(updatedOrder.status)} Your order is now ${
                  updatedOrder.status
                }!`
              );
              setToastVisible(true);
              playNotificationSound();
            }
            previousStatusRef.current = updatedOrder.status;
            setOrder(updatedOrder);
          }
        })
        .catch((err) => console.error("Polling error:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, [order?._id]);

  if (!order) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No Order Found</h2>
        <p>Please select an order to track from your profile.</p>
        <button
          onClick={() => navigate("/profile")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#ff385c",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Go to My Orders
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      <button
        onClick={() => navigate("/profile")}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          background: "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ← Back to Orders
      </button>

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "25px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Track Your Order</h2>

        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "5px 0" }}>
            <strong>Order ID:</strong> #{order._id.slice(-6).toUpperCase()}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>Restaurant:</strong> {order.restaurant?.name || "Unknown"}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>Total:</strong> £{order.totalAmount.toFixed(2)}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>Delivery Address:</strong> {order.address?.street},{" "}
            {order.address?.postcode}
          </p>
        </div>

        <DeliveryTracker key={order.status} order={order} />

        {/* Order Items */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Order Items</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {order.items.map((item, i) => (
              <li
                key={i}
                style={{
                  padding: "10px 0",
                  borderBottom:
                    i < order.items.length - 1 ? "1px solid #ddd" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {item.name} × {item.qty}
                </span>
                <span style={{ fontWeight: "bold" }}>
                  £{(item.price * item.qty).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Section */}
        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            background: "#fff3cd",
            borderRadius: "8px",
            border: "1px solid #ffc107",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.9em" }}>
            📞 <strong>Need help?</strong> Contact support at{" "}
            <a href="tel:+441234567890" style={{ color: "#ff385c" }}>
              +44 123 456 7890
            </a>{" "}
            or email{" "}
            <a href="mailto:support@ohmyfood.com" style={{ color: "#ff385c" }}>
              support@ohmyfood.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
