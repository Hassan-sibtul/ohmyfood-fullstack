import React, { useState } from "react";
import API from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await API.post("/api/auth/forgot-password", { email });
      setStatus({ type: "success", msg: "If an account exists, a reset link has been sent to your email." });
    } catch (err) {
      console.error("Forgot password error:", err);
      setStatus({ type: "error", msg: err.response?.data?.message || "Failed to send reset link." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 420, margin: "40px auto" }}>
      <h2>Forgot Password</h2>
      <p style={{ color: "#666" }}>Enter your email and we'll send you a link to reset your password.</p>

      {status && (
        <p style={{ color: status.type === "success" ? "green" : "red" }}>{status.msg}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#ff385c",
            color: "white",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
