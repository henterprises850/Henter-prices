import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiClock,
  FiEye,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // ✅ Modal state for cancel
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching orders from:",
        `${process.env.REACT_APP_API_URL}/api/orders/my-orders`
      );

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/orders/my-orders`,
        { timeout: 10000 }
      );

      console.log("Orders response:", response.data);

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Helper function to get payment method display text
  const getPaymentMethodDisplay = (paymentMethod, paymentMethodName) => {
    // If paymentMethodName exists, use it (it's a string)
    if (paymentMethodName) {
      return paymentMethodName;
    }

    // If paymentMethod is a string, use it
    if (typeof paymentMethod === "string") {
      return paymentMethod;
    }

    // If paymentMethod is an object, extract the readable version
    if (typeof paymentMethod === "object" && paymentMethod !== null) {
      if (paymentMethod.upi) {
        return `UPI (${paymentMethod.upi.upi_id || "***"})`;
      } else if (paymentMethod.card) {
        return `Card (****${paymentMethod.card.last4 || "****"})`;
      } else if (paymentMethod.netbanking) {
        return `Net Banking`;
      } else if (paymentMethod.wallet) {
        return `Wallet`;
      }
    }

    return "Online Payment";
  };

  // ✅ Check if order can be cancelled
  const canCancelOrder = (orderStatus) => {
    const cancelableStatuses = [
      "pending",
      "Order Placed",
      "confirmed",
      "processing",
      "shipped",
    ];
    return cancelableStatuses.includes(orderStatus);
  };

  // ✅ Handle cancel order
  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setActionLoading(true);

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/orders/${selectedOrderForCancel._id}/status`,
        {
          orderStatus: "cancelled",
          reason: cancellationReason,
        },
        { timeout: 10000 }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setShowCancelModal(false);
        setCancellationReason("");
        setSelectedOrderForCancel(null);
        fetchOrders();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Open cancel modal
  const openCancelModal = (order) => {
    setSelectedOrderForCancel(order);
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
      case "Order Placed":
        return <FiPackage className="h-5 w-5 text-blue-600" />;
      case "confirmed":
      case "processing":
        return <FiClock className="h-5 w-5 text-yellow-600" />;
      case "shipped":
        return <FiTruck className="h-5 w-5 text-orange-600" />;
      case "delivered":
        return <FiCheck className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <FiX className="h-5 w-5 text-red-600" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
      case "Order Placed":
        return "text-blue-600 bg-blue-100";
      case "confirmed":
      case "processing":
        return "text-yellow-600 bg-yellow-100";
      case "shipped":
        return "text-orange-600 bg-orange-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please Login
            </h2>
            <p className="text-gray-600 mb-8">
              You need to be logged in to view your orders
            </p>
            <Link
              to="/login"
              className="bg-primary-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors inline-block"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          <div className="animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="bg-gray-300 h-4 rounded mb-4"></div>
                <div className="bg-gray-300 h-32 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchOrders}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              No orders yet
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              When you place orders, they will appear here
            </p>
            <div className="mt-8">
              <Link
                to="/products"
                className="bg-primary-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Orders ({orders.length})
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">{order.orderStatus}</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Total: ₹{order.totalPrice?.toLocaleString()}
                    </p>
                    {/* ✅ FIXED: Use helper function to display payment method */}
                    <p className="text-sm text-gray-600">
                      {getPaymentMethodDisplay(
                        order.paymentMethod,
                        order.paymentMethodName
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || "/placeholder-image.jpg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size || "N/A"} | Color:{" "}
                          {item.color || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(item.quantity * item.price)?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress?.fullName}</p>
                    <p>{order.shippingAddress?.address}</p>
                    <p>
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}{" "}
                      {order.shippingAddress?.pincode}
                    </p>
                    <p>Phone: {order.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* ✅ Payment Status Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        PAYMENT STATUS
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.paymentStatus ? (
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs ${
                              order.paymentStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.paymentStatus === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() +
                              order.paymentStatus.slice(1)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>

                    {/* ✅ Show refund status if cancelled and paid */}
                    {order.orderStatus === "cancelled" &&
                      order.paymentStatus === "completed" &&
                      order.refundStatus && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            REFUND STATUS
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                order.refundStatus === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.refundStatus === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.refundStatus.charAt(0).toUpperCase() +
                                order.refundStatus.slice(1)}
                            </span>
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* ✅ Action Buttons */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    {order.orderStatus === "delivered" && (
                      <span className="text-green-600 font-medium flex items-center">
                        <FiCheck className="mr-2 h-4 w-4" />
                        Order delivered
                      </span>
                    )}
                    {order.orderStatus === "cancelled" && (
                      <span className="text-red-600 font-medium flex items-center">
                        <FiX className="mr-2 h-4 w-4" />
                        Order cancelled
                      </span>
                    )}
                  </div>

                  {/* ✅ Cancel Button - Show only if order can be cancelled */}
                  {canCancelOrder(order.orderStatus) && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                      disabled={actionLoading}
                    >
                      <FiX className="mr-2 h-4 w-4" />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Cancel Order Modal */}
      {showCancelModal && selectedOrderForCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                Cancel Order
              </h3>
              <p className="text-sm text-gray-600 text-center mt-2">
                Are you sure you want to cancel order{" "}
                <strong>#{selectedOrderForCancel._id.slice(-6)}</strong>?
              </p>
            </div>

            {/* ✅ Refund Information Alert */}
            {selectedOrderForCancel.paymentStatus === "completed" && (
              <div className="px-6 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-600 mt-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-900">
                        Refund Information
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your refund of{" "}
                        <span className="font-semibold">
                          ₹{selectedOrderForCancel.totalPrice?.toLocaleString()}
                        </span>{" "}
                        will be credited back to your payment method within{" "}
                        <span className="font-semibold">2-3 business days</span>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reason Input */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation <span className="text-red-600">*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please tell us why you want to cancel this order..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps us improve our service
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrderForCancel(null);
                  setCancellationReason("");
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={actionLoading || !cancellationReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    Cancelling...
                  </>
                ) : (
                  <>
                    <FiX className="mr-2 h-4 w-4" />
                    Yes, Cancel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
