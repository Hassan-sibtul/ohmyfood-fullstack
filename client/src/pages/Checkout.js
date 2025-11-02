import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import API from "../api";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart } = useContext(CartContext); // get cart here

  const [address, setAddress] = useState({
    street: "",
    postcode: "",
    county: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch saved address when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await API.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // If user has a saved address, use it
        if (data.address) {
          setAddress(data.address);
        }
      } catch (err) {
        console.warn("Could not fetch saved address:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !address.street ||
      !address.postcode ||
      !address.county ||
      !address.country
    ) {
      alert("Please fill out all address fields.");
      return;
    }

    // ✅ Send to OrderReceipt with address + cart
    navigate("/order-receipt", { state: { address, cart } });
  };

  if (loading) {
    return <div>Loading saved address...</div>;
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className="address-form">
          <label>
            Street Address
            <input
              type="text"
              name="street"
              placeholder="123 Main St"
              value={address.street}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Postcode
            <input
              type="text"
              name="postcode"
              placeholder="E.g. W1A 1AA"
              value={address.postcode}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            County
            <input
              type="text"
              name="county"
              placeholder="E.g. Greater London"
              value={address.county}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Country
            <input
              type="text"
              name="country"
              placeholder="E.g. United Kingdom"
              value={address.country}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="checkout-actions">
          <button className="btn-secondary" onClick={() => navigate("/cart")}>
            ← Back to Cart
          </button>
          <button
            className="btn-primary"
            type="submit"
            style={{
              marginLeft: 10,
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
            }}
          >
            Proceed to Payment →
          </button>
        </div>
      </form>
    </div>
  );
}
