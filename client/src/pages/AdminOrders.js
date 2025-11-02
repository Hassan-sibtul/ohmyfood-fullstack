import React, { useEffect, useState } from "react";
import API from "../api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all orders (requires admin token)
  useEffect(() => {
    API.get("/api/orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        console.log("📦 Orders received:", res.data);
        setOrders(res.data);
      })
      .catch((err) => console.error("❌ Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

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

  const renderTable = (ordersList) => (
    <table className="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Restaurant</th>
          <th>Items</th>
          <th>Total (£)</th>
          <th>Address</th>
          <th>Status</th>
          <th>Update</th>
        </tr>
      </thead>
      <tbody>
        {ordersList.map((order) => (
          <tr key={order._id}>
            <td>#{order._id.slice(-6)}</td>
            <td>
              {order.user?.name || "N/A"} <br />
              <small>{order.user?.email || ""}</small>
            </td>
            <td>{order.restaurant?.name || "Unknown"}</td>
            <td>
              {order.items.map((item, i) => (
                <div key={i}>
                  {item.name} × {item.qty}
                </div>
              ))}
            </td>
            <td>{order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}</td>
            <td>
              {order.address?.street}, {order.address?.postcode},{" "}
              {order.address?.county}, {order.address?.country}
            </td>
            <td>
              <span
                className={`status ${order.status
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {order.status}
              </span>
            </td>
            <td>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
              >
                <option value="Paid">Paid</option>
                <option value="Preparing">Preparing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="admin-orders">
      <h2>📦 Restaurant Orders</h2>

      <h3>⏳ Pending Orders</h3>
      {pendingOrders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        renderTable(pendingOrders)
      )}

      <h3>✅ Completed Orders</h3>
      {completedOrders.length === 0 ? (
        <p>No delivered orders.</p>
      ) : (
        renderTable(completedOrders)
      )}
    </div>
  );
}
