"use client"
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({}); // { itemId: quantity }
  const [table, setTable] = useState(null);

  // Load from LocalStorage on mount (so data survives refresh)
  useEffect(() => {
    const savedCart = localStorage.getItem("mg_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save to LocalStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("mg_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (itemId, qty) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const newVal = current + qty;
      if (newVal <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: newVal };
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem("mg_cart");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, table, setTable }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}