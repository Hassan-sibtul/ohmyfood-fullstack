import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        © 2025 OhMyFood ·<a href="#"> Suggest a restaurant </a> ·
        <a href="#"> Become a partner </a> ·<a href="#"> Legal </a> ·
        <a href="#"> Contact </a>
      </p>
    </footer>
  );
}
