import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { toast } from "react-toastify";

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
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

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

  // Mock Razorpay Payment Handler
  const handleMockRazorpayPayment = async () => {
    try {
      toast.info("Initiating mock payment...");

      // Create order in database first
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          size: item.selectedSize, // Use selected size (string)
          color: item.selectedColor, // Use selected color (string)
          price: item.price,
          image: item.images[0],
        })),
        shippingAddress,
        paymentMethod: "Online",
        totalPrice: total,
        shippingPrice: shipping,
        taxPrice: tax,
      };

      console.log("Order data being sent:", orderData); // Debug log

      const dbOrderResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        orderData
      );

      const dbOrder = dbOrderResponse.data.order;

      // Create mock Razorpay order
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/razorpay/create-order`,
        { amount: total }
      );

      const { order } = orderResponse.data;

      // Simulate Razorpay checkout modal
      const mockPaymentData = {
        razorpay_order_id: order.id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature:
          "mock_signature_" + Math.random().toString(36).substring(7),
      };

      // Show mock payment processing
      toast.info("Processing mock payment...", { autoClose: 2000 });

      // Simulate payment delay
      setTimeout(async () => {
        try {
          // Verify mock payment
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/payment/razorpay/verify`,
            {
              ...mockPaymentData,
              orderId: dbOrder._id,
            }
          );

          clearCart();
          toast.success("Mock payment successful!");
          navigate(`/order-success/${dbOrder._id}`);
        } catch (error) {
          toast.error("Mock payment verification failed");
        }
      }, 3000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment initiation failed");
      setLoading(false);
    }
  };

  const handleCODOrder = async () => {
    try {
      console.log("Placing COD order...");
      console.log("Cart items before mapping:", cartItems);

      const orderData = {
        orderItems: cartItems.map((item) => {
          console.log("Mapping cart item:", {
            id: item._id,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            availableSizes: item.sizes,
            availableColors: item.colors,
          });

          return {
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            size: item.selectedSize, // Use selected size (string)
            color: item.selectedColor, // Use selected color (string)
            price: item.price,
            image: item.images[0],
          };
        }),
        shippingAddress,
        paymentMethod: "COD",
        totalPrice: total,
        shippingPrice: shipping,
        taxPrice: tax,
      };

      console.log(
        "Final order data being sent:",
        JSON.stringify(orderData, null, 2)
      );

      const orderResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        orderData
      );

      console.log("Order response:", orderResponse.data);

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-success/${orderResponse.data.order._id}`);
    } catch (error) {
      console.error("COD Order error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Order placement failed";

      console.error("Error details:", error.response?.data);
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentMethod === "COD") {
        await handleCODOrder();
      } else if (paymentMethod === "MockRazorpay") {
        await handleMockRazorpayPayment();
      }
    } catch (error) {
      toast.error("Order processing failed");
    } finally {
      setLoading(false);
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
              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label
                      htmlFor="cod"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Cash on Delivery
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="mockRazorpay"
                      name="paymentMethod"
                      type="radio"
                      value="MockRazorpay"
                      checked={paymentMethod === "MockRazorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label
                      htmlFor="mockRazorpay"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Mock Online Payment (Testing) 🧪
                    </label>
                  </div>
                </div>

                {/* Mock Payment Notice */}
                {paymentMethod === "MockRazorpay" && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      🧪 <strong>Development Mode:</strong> This is a mock
                      payment for testing purposes. No real money will be
                      charged.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Place Order - ₹${total}`}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
