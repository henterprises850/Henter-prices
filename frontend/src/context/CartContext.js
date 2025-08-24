import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load cart from database when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartFromDatabase();
    } else {
      // Load from localStorage if not authenticated
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [isAuthenticated, user]);

  // Sync cart to database whenever cartItems changes (for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user && cartItems.length >= 0) {
      syncCartToDatabase();
    }
    // Always save to localStorage as backup
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems, isAuthenticated, user]);

  const loadCartFromDatabase = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/cart`
      );

      if (response.data.success && response.data.cart.items.length > 0) {
        // Convert backend cart format to frontend format
        const frontendCartItems = response.data.cart.items.map((item) => ({
          ...item.product,
          selectedSize: item.size,
          selectedColor: item.color,
          quantity: item.quantity,
          cartId: `${item.product._id}-${item.size}-${item.color}`,
        }));
        setCartItems(frontendCartItems);
      }
    } catch (error) {
      console.error("Error loading cart from database:", error);
      // Fallback to localStorage
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } finally {
      setLoading(false);
    }
  };

  const syncCartToDatabase = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/cart/save`, {
        items: cartItems,
      });
    } catch (error) {
      console.error("Error syncing cart to database:", error);
    }
  };

  const addToCart = (product, size, color, quantity = 1) => {
    const existingItem = cartItems.find(
      (item) =>
        item._id === product._id &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item._id === product._id &&
          item.selectedSize === size &&
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          ...product,
          selectedSize: size,
          selectedColor: color,
          quantity,
          cartId: `${product._id}-${size}-${color}`,
        },
      ]);
    }

    toast.success("Item added to cart!");
  };

  const removeFromCart = (cartId) => {
    setCartItems(cartItems.filter((item) => item.cartId !== cartId));
    toast.success("Item removed from cart!");
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");

    // Clear from database if user is authenticated
    if (isAuthenticated && user) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/api/cart/clear`)
        .catch((error) =>
          console.error("Error clearing cart from database:", error)
        );
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    syncCartToDatabase,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
