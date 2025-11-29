"use client"
// 1. Import useCallback
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [table, setTable] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("mg_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("mg_cart", JSON.stringify(cart));
  }, [cart]);

  // 2. Wrap addToCart in useCallback
  const addToCart = useCallback((itemId, qty) => {
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
  }, []);

  // 3. Wrap clearCart in useCallback (THIS FIXES YOUR ERROR)
  const clearCart = useCallback(() => {
    setCart({});
    localStorage.removeItem("mg_cart");
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, table, setTable }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}