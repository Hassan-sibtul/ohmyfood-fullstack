// client/src/pages/OrderConfirmation.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const {
    // Passed from Payment.js navigate(..., { state: { ... } })
    orders = [], // array of created orders (one per restaurant)
    total = 0, // total actually paid after discount
    discount = 0, // discount applied (£)
    subtotal, // optional: original subtotal (before discount)
    pointsRedeemed, // optional: points used
  } = state || {};

  // Fallbacks if some values weren’t passed
  const computedSubtotal = useMemo(() => {
    if (typeof subtotal === "number") return subtotal;
    // derive from orders if not explicitly provided
    const calc = (orders || []).reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );
    return Number.isFinite(calc) ? calc : total + (discount || 0);
  }, [subtotal, orders, total, discount]);

  const ptsRedeemed = useMemo(() => {
    if (typeof pointsRedeemed === "number") return pointsRedeemed;
    // 1 point = £0.01  => points = discount * 100
    return Math.round((discount || 0) * 100);
  }, [pointsRedeemed, discount]);

  // Load current loyalty balance to show updated points
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingBalance(false);
      return;
    }
    API.get("/api/users/loyalty", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setBalance(res.data?.loyaltyPoints ?? null))
      .catch(() => setBalance(null))
      .finally(() => setLoadingBalance(false));
  }, []);

  // If user hit this route directly, nudge them home
  useEffect(() => {
    if (!orders || orders.length === 0) {
      // We won’t redirect immediately to let the message show
      // but provide a clear link.
    }
  }, [orders]);

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 16px" }}>
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>🎉 Order Confirmed</h2>
        <p style={{ marginTop: 8, color: "#555" }}>
          Thanks for your order! We’ve sent you an email confirmation.
        </p>
      </div>

      {/* Summary card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
            background: "#fff",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Order Summary</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              rowGap: 6,
              columnGap: 12,
              fontSize: "0.95rem",
            }}
          >
            <div>Subtotal</div>
            <div>£{computedSubtotal.toFixed(2)}</div>

            <div>Discount (loyalty)</div>
            <div style={{ color: discount > 0 ? "#0a7" : "#333" }}>
              {discount > 0 ? <>-£{discount.toFixed(2)}</> : "£0.00"}
            </div>

            <div style={{ borderTop: "1px dashed #ddd", marginTop: 6 }} />
            <div style={{ borderTop: "1px dashed #ddd", marginTop: 6 }} />

            <div style={{ fontWeight: 700 }}>Total paid</div>
            <div style={{ fontWeight: 700, color: "#ff385c" }}>
              £{Number(total).toFixed(2)}
            </div>

            <div style={{ marginTop: 10 }}>Points redeemed</div>
            <div style={{ marginTop: 10 }}>
              {ptsRedeemed > 0 ? ptsRedeemed : 0}
            </div>

            <div>Updated points balance</div>
            <div>
              {loadingBalance ? "Loading…" : balance === null ? "—" : balance}
            </div>
          </div>
        </div>
      </div>

      {/* Orders list */}
      {!orders || orders.length === 0 ? (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
            background: "#fff",
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0 }}>
            No order details found.{" "}
            <Link to="/" style={{ color: "#ff385c" }}>
              Go back home
            </Link>
            .
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 16,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h4 style={{ margin: 0 }}>
                  Order #{(order._id || "").slice(-6).toUpperCase()}
                </h4>
                <div>
                  <span
                    style={{
                      background: "#f1f1f1",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: "0.85rem",
                    }}
                  >
                    {order.status || "Paid"}
                  </span>
                </div>
              </div>

              <p style={{ margin: "8px 0 6px", color: "#666" }}>
                <strong>Restaurant:</strong>{" "}
                {order.restaurant?.name || "Unknown"}
              </p>

              <div style={{ marginTop: 6 }}>
                <strong>Items:</strong>
                <ul style={{ marginTop: 6 }}>
                  {(order.items || []).map((it, idx) => (
                    <li key={idx}>
                      {it.name} × {it.quantity || it.qty || 1} — £
                      {((it.price || 0) * (it.quantity || it.qty || 1)).toFixed(
                        2
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 4 }}>
                <strong>Order total:</strong> £
                {(order.totalAmount || 0).toFixed(2)}
              </div>

              <div style={{ marginTop: 8, color: "#666" }}>
                <strong>Delivery address:</strong>
                <div>{order.address?.street}</div>
                <div>
                  {order.address?.postcode}, {order.address?.county}
                </div>
                <div>{order.address?.country}</div>
              </div>

              {/* Track My Order button */}
              <button
                onClick={() => navigate("/track-order", { state: { order } })}
                style={{
                  marginTop: 12,
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                🗺️ Track My Order
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/profile"
          style={{
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
            padding: "10px 16px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          View My Orders
        </Link>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "#ff385c",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Continue Ordering
        </button>
      </div>
    </div>
  );
}
