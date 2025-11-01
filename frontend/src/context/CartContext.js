import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        console.log(
          "✅ Cart loaded from localStorage:",
          parsedCart.length,
          "items"
        );
      } catch (error) {
        console.error("❌ Error loading cart:", error);
        setCartItems([]);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    console.log("💾 Cart saved to localStorage:", cartItems.length, "items");
  }, [cartItems]);

  // ✅ FIXED: Correct parameter order
  const addToCart = (product, size, color, quantity) => {
    console.log("📦 Adding to cart:", {
      productName: product.name,
      size,
      color,
      quantity,
    });

    setCartItems((prev) => {
      // Check if exact same product with same size/color already exists
      const existingItem = prev.find(
        (item) =>
          item._id === product._id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingItem) {
        // ✅ Update quantity if already in cart
        const updatedCart = prev.map((item) =>
          item._id === product._id &&
          item.selectedSize === size &&
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );

        console.log("✅ Updated quantity for existing item");
        toast.success(`Updated quantity in cart`);
        return updatedCart;
      }

      // ✅ Add new item to cart
      const newItem = {
        cartId: `${product._id}_${size}_${color}_${Date.now()}`,
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        quantity,
        selectedSize: size,
        selectedColor: color,
      };

      console.log("✅ New item added to cart:", newItem);
      toast.success(`${product.name} added to cart!`);

      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartId) => {
    console.log("🗑️  Removing item from cart:", cartId);

    setCartItems((prev) => {
      const updatedCart = prev.filter((item) => item.cartId !== cartId);
      if (updatedCart.length < prev.length) {
        toast.success("Item removed from cart");
      }
      return updatedCart;
    });
  };

  const updateQuantity = (cartId, quantity) => {
    console.log("🔄 Updating quantity:", cartId, quantity);

    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  // ✅ Clear cart properly
  const clearCart = () => {
    console.log("🗑️  Clearing entire cart...");
    setCartItems([]);
    localStorage.removeItem("cart");
    console.log("✅ Cart cleared completely");
  };

  const getCartTotal = () => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return Math.round(total * 100) / 100; // ✅ Round to 2 decimals
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
