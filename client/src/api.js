// client/src/api.js
import axios from "axios";

// Base URL should point to the API origin (no trailing "/api")
// so calls like API.get("/api/restaurants") resolve correctly.
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001",
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
