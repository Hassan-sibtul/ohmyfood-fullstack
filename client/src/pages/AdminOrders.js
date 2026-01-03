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
  const [expanded, setExpanded] = useState({});

  // Load all orders (admin only)
  useEffect(() => {
    API.get("/api/orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        console.log("Orders received:", res.data);
        setOrders(res.data);
        calculateAnalytics(res.data);
      })
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

  // ---------------- ANALYTICS ----------------
  const calculateAnalytics = (ordersList) => {
    const totalSales = ordersList.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const dishCount = {};
    ordersList.forEach((order) => {
      order.items.forEach((item) => {
        const { name } = item;
        if (!dishCount[name]) {
          dishCount[name] = { name, totalQty: 0 };
        }
        // ✅ FIXED: support quantity + qty
        dishCount[name].totalQty += item.quantity ?? item.qty ?? 1;
      });
    });

    const mostOrderedDish =
      Object.values(dishCount).sort((a, b) => b.totalQty - a.totalQty)[0] ||
      null;

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

    const topCustomer =
      Object.values(customerMap).sort(
        (a, b) => b.loyaltyPoints - a.loyaltyPoints
      )[0] || null;

    setAnalytics({ totalSales, mostOrderedDish, topCustomer });
  };

  // ---------------- UPDATE STATUS ----------------
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

  const pendingOrders = orders.filter((o) => o.status !== "Delivered");
  const completedOrders = orders.filter((o) => o.status === "Delivered");

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderAccordion = (ordersList) => (
    <div className="order-accordion">
      {ordersList.map((order) => {
        const isOpen = !!expanded[order._id];
        const total = order.totalAmount?.toFixed(2) || "0.00";
        const created = order.createdAt
          ? new Date(order.createdAt).toLocaleString()
          : "";

        return (
          <div key={order._id} className={`order-card ${isOpen ? "open" : ""}`}>
            <button
              className="order-summary"
              onClick={() => toggleExpand(order._id)}
            >
              <span className={`chevron ${isOpen ? "rot" : ""}`}>▸</span>
              <span className="summary-id">#{order._id.slice(-6)}</span>
              <span className="summary-customer">
                {order.user?.name || "N/A"}
                <small>{order.user?.email}</small>
              </span>
              <span className="summary-restaurant">
                {order.restaurant?.name || "Unknown"}
              </span>
              <span className="summary-total">£{total}</span>
              <span className="summary-status">{order.status}</span>
              <span className="summary-date">{created}</span>
            </button>

            <div
              className="order-details"
              style={{ maxHeight: isOpen ? 800 : 0 }}
            >
              <div className="detail-grid">
                {/* ITEMS */}
                <div className="detail-block">
                  <h4>Items</h4>
                  <ul className="items-list">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        <span className="item-name">{item.name}</span>
                        {/* ✅ FIXED */}
                        <span className="item-qty">
                          × {item.quantity ?? item.qty ?? 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ADDRESS */}
                <div className="detail-block">
                  <h4>Address</h4>
                  <p>
                    {order.address?.street}
                    <br />
                    {order.address?.postcode}, {order.address?.county}
                    <br />
                    {order.address?.country}
                  </p>
                </div>

                {/* INSTRUCTIONS */}
                <div className="detail-block">
                  <h4>Instructions</h4>
                  {order.specialInstructions || <span>—</span>}
                </div>

                {/* STATUS */}
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
      <h2>Restaurant Orders</h2>

      <h3>⏳ Pending Orders</h3>
      {pendingOrders.length ? (
        renderAccordion(pendingOrders)
      ) : (
        <p>No pending orders.</p>
      )}

      <h3>✅ Completed Orders</h3>
      {completedOrders.length ? (
        renderAccordion(completedOrders)
      ) : (
        <p>No delivered orders.</p>
      )}
    </div>
  );
}
