import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState({
    street: "",
    postcode: "",
    county: "",
    country: "",
  });
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    line1: "",
    city: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    API.get("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const data = res.data || {};
        setUser(data);
        setAddress(data.address || {});
        setBillingDetails(data.billingDetails || {});
      })
      .catch((err) => console.error("❌ Fetch profile error:", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleBillingChange = (e) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.put(
        "/api/users/profile",
        { address, billingDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Profile updated successfully!");
      setUser(data.user || user);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("❌ Could not save profile changes.");
    }
  };

  if (loading) return <div className="page-loading">Loading profile...</div>;

  return (
    <div
      className="account-page"
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>My Profile</h2>

      {user && (
        <>
          {/* Personal Info */}
          <section style={{ marginBottom: "25px" }}>
            <h3>Personal Info</h3>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </section>

          {/* Address */}
          <section style={{ marginBottom: "25px" }}>
            <h3>Delivery Address</h3>
            <input
              type="text"
              name="street"
              value={address.street || ""}
              onChange={handleAddressChange}
              placeholder="Street"
            />
            <input
              type="text"
              name="postcode"
              value={address.postcode || ""}
              onChange={handleAddressChange}
              placeholder="Postcode"
            />
            <input
              type="text"
              name="county"
              value={address.county || ""}
              onChange={handleAddressChange}
              placeholder="County"
            />
            <input
              type="text"
              name="country"
              value={address.country || ""}
              onChange={handleAddressChange}
              placeholder="Country"
            />
          </section>

          {/* Billing */}
          <section style={{ marginBottom: "25px" }}>
            <h3>Billing Details</h3>
            <input
              type="text"
              name="name"
              value={billingDetails.name || ""}
              onChange={handleBillingChange}
              placeholder="Cardholder Name"
            />
            <input
              type="text"
              name="line1"
              value={billingDetails.line1 || ""}
              onChange={handleBillingChange}
              placeholder="Billing Address"
            />
            <input
              type="text"
              name="city"
              value={billingDetails.city || ""}
              onChange={handleBillingChange}
              placeholder="City"
            />
            <input
              type="text"
              name="country"
              value={billingDetails.country || ""}
              onChange={handleBillingChange}
              placeholder="Country"
            />
          </section>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={handleSave} className="btn-primary">
              💾 Save Changes
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="btn-secondary"
            >
              📦 My Orders
            </button>
          </div>
        </>
      )}
    </div>
  );
}
