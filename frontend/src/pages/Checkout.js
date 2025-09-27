import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { toast } from "react-toastify";
import { load } from "@cashfreepayments/cashfree-js";

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [cashfree, setCashfree] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
    initializeCashfree();
  }, [cartItems, navigate]);

  // Initialize Cashfree SDK
  const initializeCashfree = async () => {
    try {
      const cashfreeInstance = await load({
        mode: process.env.REACT_APP_CASHFREE_MODE || "sandbox", // sandbox or production
      });
      setCashfree(cashfreeInstance);
    } catch (error) {
      console.error("Failed to initialize Cashfree:", error);
      toast.error("Payment system initialization failed");
    }
  };

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    const subtotal = getCartTotal();
    const shipping = subtotal > 999 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotal();

  // Validate shipping address
  const validateShippingAddress = () => {
    const required = [
      "fullName",
      "address",
      "city",
      "state",
      "pincode",
      "phone",
    ];
    return required.every((field) => shippingAddress[field]?.trim());
  };

  // Cashfree Payment Handler
  const handleCashfreePayment = async () => {
    try {
      if (!validateShippingAddress()) {
        toast.error("Please fill in all shipping address fields");
        return;
      }

      if (!cashfree) {
        toast.error(
          "Payment system not initialized. Please refresh and try again."
        );
        return;
      }

      setLoading(true);
      toast.info("Creating payment order...");

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.price,
          image: item.images[0],
        })),
        shippingAddress,
        paymentMethod: "CASHFREE",
        totalPrice: total,
        shippingPrice: shipping,
        taxPrice: tax,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/cashfree/create-order`,
        {
          orderData,
          amount: total,
          customerDetails: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Orderdata created:", orderData);

      if (response.data.success) {
        const { paymentSessionId, orderId } = response.data;

        // Open Cashfree checkout
        const checkoutOptions = {
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self",
        };

        toast.success("Opening payment gateway...");

        // Handle payment result
        const result = await cashfree.checkout(checkoutOptions);

        if (result.error) {
          console.error("Payment failed:", result.error);
          toast.error("Payment failed. Please try again.");

          // Mark order as failed
          await handlePaymentResult(orderId, "FAILED", result.error);
        } else {
          console.log("Payment completed successfully:", result);

          // Verify payment on backend
          setTimeout(() => {
            verifyPayment(orderId);
          }, 2000);
        }
      } else {
        toast.error(response.data.message || "Failed to create payment order");
      }
    } catch (error) {
      console.error("Cashfree payment error:", error);
      toast.error(
        error.response?.data?.message || "Payment initialization failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify payment status
  const verifyPayment = async (orderId) => {
    try {
      setLoading(true);
      toast.info("Verifying payment...");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/payment/cashfree/verify/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const { paymentStatus, order } = response.data;

        if (paymentStatus === "SUCCESS") {
          clearCart();
          toast.success("Payment successful! Order confirmed.");
          navigate(`/order-success/${orderId}`);
        } else if (paymentStatus === "PENDING") {
          toast.warning(
            "Payment is being processed. You'll receive confirmation shortly."
          );
          navigate(`/order-pending/${orderId}`);
        } else {
          toast.error("Payment failed or was cancelled.");
          navigate(`/order-failed/${orderId}`);
        }
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Failed to verify payment status");
    } finally {
      setLoading(false);
    }
  };

  // Handle payment result callback
  const handlePaymentResult = async (orderId, status, error = null) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/cashfree/callback`,
        {
          orderId,
          status,
          error: error?.message || error,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  // COD Order Handler (unchanged)
  const handleCODOrder = async () => {
    try {
      if (!validateShippingAddress()) {
        toast.error("Please fill in all shipping address fields");
        return;
      }

      setLoading(true);
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.price,
          image: item.images[0],
        })),
        shippingAddress,
        paymentMethod: "COD",
        totalPrice: total,
        shippingPrice: shipping,
        taxPrice: tax,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-success/${response.data.order._id}`);
    } catch (error) {
      console.error("COD Order error:", error);
      toast.error(error.response?.data?.message || "Order placement failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === "COD") {
      await handleCODOrder();
    } else if (paymentMethod === "CASHFREE") {
      await handleCashfreePayment();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address (unchanged) */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={shippingAddress.email}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={shippingAddress.pincode}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="cod"
                      name="paymentMethod"
                      type="radio"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="cod"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      💵 Cash on Delivery
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="cashfree"
                      name="paymentMethod"
                      type="radio"
                      value="CASHFREE"
                      checked={paymentMethod === "CASHFREE"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="cashfree"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      💳 Online Payment (Cards, UPI, Net Banking)
                    </label>
                  </div>
                </div>

                {/* Payment Method Info */}
                {paymentMethod === "CASHFREE" && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      💳 <strong>Secure Online Payment:</strong> Pay using
                      Credit/Debit Cards, UPI, Net Banking, or Wallets. Powered
                      by Cashfree - 100% secure and fast.
                    </p>
                  </div>
                )}

                {paymentMethod === "COD" && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      💵 <strong>Cash on Delivery:</strong> Pay when your order
                      arrives at your doorstep. No advance payment required.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading || (paymentMethod === "CASHFREE" && !cashfree)
                }
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Processing..."
                  : paymentMethod === "CASHFREE"
                  ? `Pay ₹${total} - Secure Payment`
                  : `Place Order - ₹${total}`}
              </button>

              {paymentMethod === "CASHFREE" && !cashfree && (
                <p className="text-sm text-red-600 text-center">
                  Payment system is loading... Please wait.
                </p>
              )}
            </form>
          </div>

          {/* Order Summary (unchanged) */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.cartId} className="flex items-center space-x-4">
                  <img
                    src={item.images[0] || "/placeholder-image.jpg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.selectedSize} | Color: {item.selectedColor}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <div className="text-lg font-semibold">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (GST)</span>
                <span>₹{tax}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            {paymentMethod === "CASHFREE" && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 text-center">
                  🔒 <strong>100% Secure Payment</strong>
                  <br />
                  Your payment information is encrypted and secure
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
