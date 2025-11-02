import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (!payload.isAdmin) {
      return <Navigate to="/" />; // Non-admins are redirected
    }

    return children; // ✅ Admin can access
  } catch (err) {
    console.error("❌ Invalid token", err);
    return <Navigate to="/login" />;
  }
}
