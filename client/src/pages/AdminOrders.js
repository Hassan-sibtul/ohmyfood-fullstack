import React, { useEffect, useState } from "react";
import API from "../api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    mostOrderedDish: null,
    topCustomer: null,
  });
  const [expanded, setExpanded] = useState({}); // id -> boolean

  // Load all orders (requires admin token)
  useEffect(() => {
    API.get("/api/orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        console.log("📦 Orders received:", res.data);
        setOrders(res.data);
        calculateAnalytics(res.data);
      })
      .catch((err) => console.error("❌ Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

  // Calculate analytics from orders
  const calculateAnalytics = (ordersList) => {
    // 1️⃣ Total sales
    const totalSales = ordersList.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // 2️⃣ Most ordered dish
    const dishCount = {};
    ordersList.forEach((order) => {
      order.items.forEach((item) => {
        const { name } = item;
        if (!dishCount[name]) {
          dishCount[name] = { name, count: 0, totalQty: 0 };
        }
        dishCount[name].count += 1;
        dishCount[name].totalQty += item.qty || 1;
      });
    });

    const mostOrderedDish = Object.values(dishCount).sort(
      (a, b) => b.totalQty - a.totalQty
    )[0] || null;

    // 3️⃣ Top customer by loyalty points
    const customerMap = {};
    ordersList.forEach((order) => {
      if (order.user) {
        const userId = order.user._id || order.user.id;
        if (!customerMap[userId]) {
          customerMap[userId] = {
            name: order.user.name,
            email: order.user.email,
            loyaltyPoints: order.user.loyaltyPoints || 0,
            orderCount: 0,
          };
        }
        customerMap[userId].orderCount += 1;
      }
    });

    const topCustomer = Object.values(customerMap).sort(
      (a, b) => b.loyaltyPoints - a.loyaltyPoints
    )[0] || null;

    setAnalytics({ totalSales, mostOrderedDish, topCustomer });
  };

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await API.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? data : order))
      );
    } catch (err) {
      console.error("❌ Failed to update status:", err);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  // Separate pending vs completed
  const pendingOrders = orders.filter((o) => o.status !== "Delivered");
  const completedOrders = orders.filter((o) => o.status === "Delivered");

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderAccordion = (ordersList) => (
    <div className="order-accordion">
      {ordersList.map((order) => {
        const isOpen = !!expanded[order._id];
        const total = order.totalAmount ? order.totalAmount.toFixed(2) : "0.00";
        const created = order.createdAt
          ? new Date(order.createdAt).toLocaleString()
          : "";
        return (
          <div key={order._id} className={`order-card ${isOpen ? "open" : ""}`}>
            <button
              className="order-summary"
              onClick={() => toggleExpand(order._id)}
              aria-expanded={isOpen}
            >
              <span className={`chevron ${isOpen ? "rot" : ""}`}>▸</span>
              <span className="summary-id">#{order._id.slice(-6)}</span>
              <span className="summary-customer">
                {order.user?.name || "N/A"}
                <small className="summary-sub">{order.user?.email || ""}</small>
              </span>
              <span className="summary-restaurant">{order.restaurant?.name || "Unknown"}</span>
              <span className="summary-total">£{total}</span>
              <span className="summary-status">
                <span
                  className={`status ${order.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {order.status}
                </span>
              </span>
              <span className="summary-date">{created}</span>
            </button>

            <div className="order-details" style={{ maxHeight: isOpen ? 800 : 0 }}>
              <div className="detail-grid">
                <div className="detail-block">
                  <h4>Items</h4>
                  <ul className="items-list">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">× {item.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-block">
                  <h4>Address</h4>
                  <p className="mono">
                    {order.address?.street}
                    <br />
                    {order.address?.postcode}, {order.address?.county}
                    <br />
                    {order.address?.country}
                  </p>
                </div>

                <div className="detail-block">
                  <h4>Instructions</h4>
                  {order.specialInstructions ? (
                    <p style={{ whiteSpace: "pre-wrap" }}>{order.specialInstructions}</p>
                  ) : (
                    <p className="muted">—</p>
                  )}
                </div>

                <div className="detail-block">
                  <h4>Update Status</h4>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="admin-orders">
      <h2>📦 Restaurant Orders</h2>

      {/* Analytics Dashboard */}
      <div
        className="analytics-dashboard"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* Total Sales */}
        <div
          className="stat-card"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9em", opacity: 0.9 }}>
            💰 Total Sales
          </h4>
          <p style={{ margin: 0, fontSize: "2em", fontWeight: "bold" }}>
            £{analytics.totalSales.toFixed(2)}
          </p>
        </div>

        {/* Most Ordered Dish */}
        <div
          className="stat-card"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9em", opacity: 0.9 }}>
            🍽️ Most Ordered Dish
          </h4>
          {analytics.mostOrderedDish ? (
            <>
              <p style={{ margin: 0, fontSize: "1.3em", fontWeight: "bold" }}>
                {analytics.mostOrderedDish.name}
              </p>
              <p style={{ margin: "5px 0 0 0", fontSize: "0.9em", opacity: 0.9 }}>
                {analytics.mostOrderedDish.totalQty} orders
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: "1em" }}>No data</p>
          )}
        </div>

        {/* Top Customer */}
        <div
          className="stat-card"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9em", opacity: 0.9 }}>
            👑 Top Customer
          </h4>
          {analytics.topCustomer ? (
            <>
              <p style={{ margin: 0, fontSize: "1.3em", fontWeight: "bold" }}>
                {analytics.topCustomer.name}
              </p>
              <p style={{ margin: "5px 0 0 0", fontSize: "0.9em", opacity: 0.9 }}>
                {analytics.topCustomer.loyaltyPoints} points • {analytics.topCustomer.orderCount} orders
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: "1em" }}>No data</p>
          )}
        </div>
      </div>

      <h3>⏳ Pending Orders</h3>
      {pendingOrders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        renderAccordion(pendingOrders)
      )}

      <h3>✅ Completed Orders</h3>
      {completedOrders.length === 0 ? (
        <p>No delivered orders.</p>
      ) : (
        renderAccordion(completedOrders)
      )}
    </div>
  );
}
