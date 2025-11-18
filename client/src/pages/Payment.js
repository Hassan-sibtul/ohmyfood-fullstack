import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { CartContext } from "../context/CartContext";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import API from "../api";

const stripePromise = loadStripe(
  "pk_test_51SL4gHFrLsiRJStWdnqFsEdHiiDQYDvTOGEe53lwevsgEMz2PxhP4QjKcqgbf8h2N8EKmkIXIDLfELusYLepJqNE00oIRsCveh"
);

function CheckoutForm({ address, cart, specialInstructions }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 0),
    0
  );

  // ✅ Billing + loyalty point states
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    line1: "",
    city: "",
    postcode: "",
    country: "GB", // Default for UK
  });

  const [userPoints, setUserPoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [discount, setDiscount] = useState(0);

  const total = Math.max(subtotal - discount, 0);

  // ✅ Fetch saved profile + loyalty points
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [profileRes, loyaltyRes] = await Promise.all([
          API.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/api/users/loyalty", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.data?.billingDetails)
          setBillingDetails(profileRes.data.billingDetails);
        if (loyaltyRes.data?.loyaltyPoints)
          setUserPoints(loyaltyRes.data.loyaltyPoints);
      } catch (err) {
        console.warn("⚠️ Could not load user profile/points:", err?.message);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
  };

  // 💰 Apply loyalty points for discount
  const handleApplyPoints = () => {
    if (pointsToUse <= 0 || pointsToUse > userPoints) {
      alert("Enter a valid number of points to redeem.");
      return;
    }
    const discountValue = pointsToUse * 0.01; // 1 point = £0.01
    if (discountValue > subtotal) {
      alert("You cannot apply more points than the subtotal amount.");
      return;
    }
    setDiscount(discountValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to make a payment.");
    if (!stripe || !elements) return alert("Stripe not ready yet.");

    setLoading(true);
    try {
      const payableAmount = subtotal - discount;

      // 1️⃣ Create Stripe payment intent
      const { data: paymentIntent } = await API.post(
        "/api/payment/create-payment-intent",
        { amount: Math.round(payableAmount * 100) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const clientSecret = paymentIntent?.clientSecret;
      if (!clientSecret) throw new Error("Missing client secret from server.");

      // 2️⃣ Confirm card payment
      const card = elements.getElement(CardElement);
      const confirm = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            address: {
              line1: billingDetails.line1,
              postal_code: billingDetails.postcode, // ✅ UK-friendly
              city: billingDetails.city,
              country: billingDetails.country,
            },
          },
        },
      });

      if (confirm.error) throw confirm.error;
      if (confirm.paymentIntent.status !== "succeeded")
        throw new Error("Payment not successful.");

      // 3️⃣ Group items by restaurant
      const groupedByRestaurant = cart.reduce((acc, item) => {
        if (!item.restaurantId) {
          console.warn("Item missing restaurantId:", item);
          return acc;
        }
        if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
        acc[item.restaurantId].push(item);
        return acc;
      }, {});

      const createdOrders = [];

      // 4️⃣ Create an order for each restaurant
      for (const [restaurantId, items] of Object.entries(groupedByRestaurant)) {
        const orderTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
        const orderRes = await API.post(
          "/api/orders",
          {
            restaurantId,
            items,
            totalAmount: orderTotal,
            address,
            specialInstructions,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        createdOrders.push(orderRes.data);
      }

      // 5️⃣ Deduct redeemed points
      if (pointsToUse > 0) {
        try {
          await API.put(
            "/api/users/redeem",
            { pointsToRedeem: pointsToUse },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log(`💎 Redeemed ${pointsToUse} points`);
        } catch (err) {
          console.warn("⚠️ Could not redeem points:", err?.message);
        }
      }

      // 6️⃣ Save billing info for next time
      try {
        await API.put(
          "/api/users/profile",
          { billingDetails },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.warn("Profile update failed:", err?.message);
      }

      // 7️⃣ Clear cart & redirect
      clearCart();
      localStorage.removeItem("cart");

      navigate("/order-confirmation", {
        state: {
          total: payableAmount,
          orders: createdOrders,
          discount,                 // amount discounted on Payment page
          subtotal,                 // original subtotal before discount
          pointsRedeemed: pointsToUse, // points used this payment
        },
        replace: true,
      });
    } catch (err) {
      console.error("❌ Payment error:", err);
      alert(
        err?.message ||
          "Payment failed. Please check your card details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h3>Billing Information</h3>
      <input
        type="text"
        name="name"
        placeholder="Cardholder Name"
        value={billingDetails.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={billingDetails.email}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="line1"
        placeholder="Street Address"
        value={billingDetails.line1}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="city"
        placeholder="City"
        value={billingDetails.city}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="postcode"
        placeholder="Postcode"
        value={billingDetails.postcode}
        onChange={handleChange}
        required
      />

      {/* 💎 Redeem Points Section */}
      {userPoints > 0 && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            margin: "15px 0",
            background: "#f8f8f8",
          }}
        >
          <h4>Redeem Loyalty Points</h4>
          <p>
            You have <strong>{userPoints}</strong> points ( £
            {(userPoints * 0.01).toFixed(2)} value)
          </p>
          <input
            type="number"
            value={pointsToUse}
            onChange={(e) => setPointsToUse(Number(e.target.value))}
            min="0"
            max={userPoints}
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <button
            type="button"
            onClick={handleApplyPoints}
            style={{
              background: "#ff385c",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Apply
          </button>
          {discount > 0 && (
            <p style={{ marginTop: "5px" }}>
              Discount applied: <strong>£{discount.toFixed(2)}</strong>
            </p>
          )}
        </div>
      )}

      {/* 🧾 Summary Section */}
      <div
        style={{
          borderTop: "1px solid #ddd",
          marginTop: "15px",
          paddingTop: "10px",
          fontSize: "0.95rem",
        }}
      >
        <p>
          <strong>Subtotal:</strong> £{subtotal.toFixed(2)}
        </p>
        <p>
          <strong>Discount:</strong>{" "}
          {discount > 0 ? `-£${discount.toFixed(2)}` : "£0.00"}
        </p>
        <p>
          <strong>Total to Pay:</strong>{" "}
          <span style={{ color: "#ff385c", fontSize: "1.1em" }}>
            £{total.toFixed(2)}
          </span>
        </p>
      </div>

      <h3 style={{ marginTop: "20px" }}>Payment</h3>
      <div style={{ border: "1px solid #ddd", padding: 10, borderRadius: 6 }}>
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary"
        style={{ marginTop: 12 }}
      >
        {loading ? "Processing..." : `Pay £${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Payment() {
  const location = useLocation();
  const { address, cart, specialInstructions } =
    location.state || { address: {}, cart: [], specialInstructions: "" };

  return (
    <Elements stripe={stripePromise}>
      <div className="payment-container">
        <h2>Payment</h2>
        <CheckoutForm
          address={address}
          cart={cart}
          specialInstructions={specialInstructions}
        />
      </div>
    </Elements>
  );
}
