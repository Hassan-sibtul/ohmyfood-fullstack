// client/src/context/CartContext.js
import React, { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on startup
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Always attach restaurantId and use _id as the identifier
  const addToCart = (item, restaurantId) => {
    const itemWithRest = {
      ...item,
      restaurantId: restaurantId || item.restaurantId || null,
      qty: item.qty || 1,
    };

    setCart((prev) => {
      const exists = prev.find((i) => i._id === itemWithRest._id);
      if (exists) {
        return prev.map((i) =>
          i._id === itemWithRest._id
            ? { ...i, qty: i.qty + (itemWithRest.qty || 1) }
            : i
        );
      }
      return [...prev, itemWithRest];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  const updateQty = (id, qty) => {
    setCart((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
