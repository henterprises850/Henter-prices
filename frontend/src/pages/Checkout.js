import React, { useState, useEffect, useRef } from "react";
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
      toast.warning("Your cart is empty");
      navigate("/cart");
      return;
    }
    initializeCashfree();
  }, [cartItems, navigate]);

  const initializeCashfree = async () => {
    try {
      const cashfreeInstance = await load({
        mode: process.env.REACT_APP_CASHFREE_MODE || "sandbox",
      });
      setCashfree(cashfreeInstance);
      console.log("✅ Cashfree initialized");
    } catch (error) {
      console.error("❌ Cashfree initialization failed:", error);
      toast.error("Payment system unavailable. Using COD only.");
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
    const shipping = 0;
    const tax = 0;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotal();

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

  // ✅ UPDATED: Cashfree Payment Handler - Redirect to verification page
  const handleCashfreePayment = async () => {
    try {
      if (!validateShippingAddress()) {
        toast.error("Please fill in all shipping address fields");
        return;
      }

      if (!cashfree) {
        toast.error("Payment system not ready. Please refresh and try again.");
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
        shippingPrice: 0,
        taxPrice: 0,
        paymentMethodName: "CASHFREE",
      };

      // Create order on backend
      const createResponse = await axios.post(
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
          },
          timeout: 15000,
        }
      );

      if (!createResponse.data.success) {
        throw new Error(createResponse.data.message);
      }

      const { paymentSessionId, orderId } = createResponse.data;

      console.log("✅ Order created:", orderId);
      toast.success("Opening payment gateway...");

      // ✅ NEW: Store order ID in sessionStorage for verification page
      sessionStorage.setItem("paymentOrderId", orderId);

      // ✅ UPDATED: Open Cashfree with redirect to verification page
      const redirectUrl = `${window.location.origin}/payment-status?orderId=${orderId}&sessionId=${paymentSessionId}`;

      console.log("🔄 Opening payment with redirect to:", redirectUrl);

      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self", // ✅ CHANGED: Stay on same tab
        returnUrl: redirectUrl, // ✅ NEW: Redirect after payment
      });

      // ✅ If checkout returns without redirect, navigate manually
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
    } catch (error) {
      console.error("❌ Cashfree payment error:", error);
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Payment initialization failed"
      );
    }
  };

  // ✅ COD Order Handler
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
        shippingPrice: 0,
        taxPrice: 0,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/cod/create-order`,
        { orderData, amount: total },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        clearCart();
        toast.success(
          `✅ Order placed! Order #${response.data.orderId.slice(-8)}.`,
          { autoClose: 2000 }
        );

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error("❌ COD order error:", error);
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

  // [Rest of the JSX remains the same as before]
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address */}
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
                      placeholder="10 digit number"
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
                      placeholder="6 digit code"
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
                      className="h-4 w-4 text-blue-600"
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
                      className="h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor="cashfree"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      💳 Online Payment (UPI, Cards, Net Banking)
                    </label>
                  </div>
                </div>

                {paymentMethod === "CASHFREE" && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      🔒 100% secure payment powered by Cashfree
                    </p>
                  </div>
                )}

                {paymentMethod === "COD" && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      Pay when your order arrives at your doorstep
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading || (paymentMethod === "CASHFREE" && !cashfree)
                }
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : paymentMethod === "CASHFREE" ? (
                  `Pay ₹${total.toLocaleString()} - Secure Payment`
                ) : (
                  `Place Order - ₹${total.toLocaleString()}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
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
                      Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-lg font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (GST)</span>
                <span>₹0</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            {paymentMethod === "CASHFREE" && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 text-center">
                  🔒 <strong>100% Secure</strong>
                  <br />
                  Your payment is encrypted and secure
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
