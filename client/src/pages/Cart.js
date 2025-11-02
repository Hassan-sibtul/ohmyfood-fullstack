// client/src/pages/Cart.js
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, updateQty } = useContext(CartContext);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  const total = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);

  if (cart.length === 0) {
    return <div style={{ padding: 20 }}>🛒 Your cart is empty</div>;
  }

  const handleCheckout = () => {
    if (!user) {
      alert("You must be logged in to proceed to checkout.");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Cart</h2>
      {cart.map((item, idx) => (
        <div
          key={item._id || idx} // unique key (prefer _id)
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            padding: "10px",
            border: "1px solid #eee",
            borderRadius: "8px",
          }}
        >
          <span>
            <strong>{item.name}</strong> (£{(item.price || 0).toFixed(2)})
          </span>
          <div>
            <button
              onClick={() =>
                updateQty(item._id, Math.max((item.qty || 1) - 1, 1))
              }
            >
              -
            </button>
            <span style={{ margin: "0 8px" }}>{item.qty || 1}</span>
            <button onClick={() => updateQty(item._id, (item.qty || 1) + 1)}>
              +
            </button>
            <button
              onClick={() => removeFromCart(item._id)}
              style={{
                marginLeft: 10,
                background: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <h3 style={{ textAlign: "right", marginTop: 20 }}>
        Total: £{total.toFixed(2)}
      </h3>
      <div style={{ textAlign: "right" }}>
        <button
          style={{
            background: "#ff385c",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
          }}
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
