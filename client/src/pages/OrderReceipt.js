import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, cart, specialInstructions } = location.state || {
    address: {},
    cart: [],
    specialInstructions: "",
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (!cart.length) {
    return (
      <div className="order-receipt">
        <h2>No items in your order</h2>
        <button className="btn-primary" onClick={() => navigate("/")}>
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="order-receipt">
      <h2>Order Summary</h2>

      {/* Address */}
      <div className="address-summary">
        <h3>Delivery Address</h3>
        <p>{address.street}</p>
        <p>{address.postcode}</p>
        <p>{address.county}</p>
        <p>{address.country}</p>
      </div>

      {/* Cart Items */}
      <div className="cart-summary">
        <h3>Your Items</h3>
        {cart.map((item, index) => (
          <div key={index} className="summary-item">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>£{(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-total">
          <strong>Total: </strong> £{total.toFixed(2)}
        </div>
      </div>

      {/* Special Instructions Summary */}
      {specialInstructions && (
        <div
          className="special-instructions"
          style={{
            background: "#fffbea",
            border: "1px solid #ffe58f",
            borderRadius: 8,
            padding: 12,
            marginTop: 12,
          }}
        >
          <strong>Special Instructions:</strong>
          <p style={{ margin: "6px 0 0 0", whiteSpace: "pre-wrap" }}>
            {specialInstructions}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="summary-actions">
        <button className="btn-secondary" onClick={() => navigate("/cart")}>
          ← Modify Order
        </button>
        <button
          className="btn-primary"
          onClick={() =>
            navigate("/payment", { state: { address, cart, specialInstructions } })
          }
        >
          Confirm & Pay →
        </button>
      </div>
    </div>
  );
}
