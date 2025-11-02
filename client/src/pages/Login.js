import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await API.post("/api/auth/login", { email, password });
      const { user, token } = res.data || {};

      if (!token || !user) {
        throw new Error("Invalid server response. Missing user or token.");
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Optional: Notify other components
      window.dispatchEvent(
        new CustomEvent("authChanged", { detail: { user, token } })
      );

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
      );
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#ff385c",
            color: "white",
          }}
        >
          Login
        </button>
      </form>
      <p>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
      <p>
        <Link to="/forgot-password" style={{ color: "#ff385c" }}>
          Forgot password?
        </Link>
      </p>
    </div>
  );
}
