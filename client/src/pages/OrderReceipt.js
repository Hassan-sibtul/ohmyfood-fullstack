import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, cart } = location.state || { address: {}, cart: [] };

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

      {/* Actions */}
      <div className="summary-actions">
        <button className="btn-secondary" onClick={() => navigate("/cart")}>
          ← Modify Order
        </button>
        <button
          className="btn-primary"
          onClick={() => navigate("/payment", { state: { address, cart } })}
        >
          Confirm & Pay →
        </button>
      </div>
    </div>
  );
}
