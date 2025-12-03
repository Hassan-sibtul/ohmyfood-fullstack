// client/src/components/Navbar.js
import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";

export default function Navbar() {
  const { cart } = useContext(CartContext);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); // Detect route changes

  const token = localStorage.getItem("token");

  // Decode JWT to check if admin
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isAdmin = payload.isAdmin;
    } catch (e) {
      console.error("Invalid token decode:", e);
    }
  }

  // Load user initially and update on route changes
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(savedUser);
  }, [location]);

  // Also update user when localStorage changes (e.g., login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(updatedUser);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const getInitial = (name = "") => name?.charAt(0)?.toUpperCase() || "?";

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 40px",
        borderBottom: "1px solid #eee",
      }}
    >
      {/* Logo */}
      <div className="navbar-left">
        <Link to="/" className="logo-link">
          <img
            src={`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/static/logo/ohmyfood.png`}
            alt="OhMyFood"
            className="logo"
            style={{ height: "40px" }}
          />
        </Link>
      </div>

      {/* Right Section */}
      <div
        className="navbar-right"
        style={{ display: "flex", alignItems: "center", gap: "20px" }}
      >
        {/* Cart icon */}
        <Link to="/cart" className="cart-icon" style={{ position: "relative" }}>
          🛒
          {cartCount > 0 && (
            <span
              className="cart-badge"
              style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                background: "#ff385c",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>

        {/* User dropdown */}
        {user ? (
          <div
            ref={dropdownRef}
            style={{ position: "relative" }}
            className="user-menu"
          >
            {/* Avatar Circle */}
            <div
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#ff385c",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
                cursor: "pointer",
                userSelect: "none",
              }}
              title={user.name}
            >
              {getInitial(user.name)}
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="dropdown-menu"
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  width: "200px",
                  zIndex: 10,
                  animation: "fadeIn 0.15s ease-in-out",
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #eee",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {user.name}
                </div>

                {/* View Profile */}
                <Link
                  to="/account"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 15px",
                    textDecoration: "none",
                    color: "#333",
                  }}
                >
                  View Profile
                </Link>

                {/* My Orders */}
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 15px",
                    textDecoration: "none",
                    color: "#333",
                  }}
                >
                  My Orders
                </Link>

                {/* Admin Dashboard */}
                {isAdmin && (
                  <Link
                    to="/admin/orders"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 15px",
                      textDecoration: "none",
                      color: "#333",
                    }}
                  >
                    Admin Dashboard
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 15px",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#ff385c",
                    fontWeight: "bold",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
