import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiPhone,
  FiEdit3,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
} from "react-icons/fi";

const DeliveryBoyDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [editingOrder, setEditingOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState("");

  // Search debounce
  const searchTimeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
  });

  // ✅ FIX: Only fetch on mount
  useEffect(() => {
    if (isAuthenticated && user?.isDeliveryBoy) {
      fetchOrders();
      fetchStats();
    }
  }, []); // Empty dependency array

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchOrders = async (
    currentFilters = filters,
    currentPage = pagination.currentPage
  ) => {
    try {
      setLoading(true);

      const cleanedFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, value]) => value !== "")
      );

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: pagination.limit,
        ...cleanedFilters,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/delivery-boy/orders?${queryParams}`,
        { timeout: 10000 }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          totalOrders: response.data.pagination.totalOrders,
          currentPage: currentPage,
        }));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 429) {
        toast.warning("Too many requests. Please wait a moment.");
      } else {
        toast.error("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/delivery-boy/stats`,
        { timeout: 10000 }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // ✅ Get next status based on current status
  const getNextStatus = (currentStatus) => {
    const transitions = {
      processing: "shipped",
      shipped: "delivered",
      delivered: null,
    };
    return transitions[currentStatus] || null;
  };

  // ✅ NEW: Handle payment status update (for COD orders)
  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      setLoading(true);

      const payload = {
        paymentStatus: newPaymentStatus,
      };

      if (paymentNotes) {
        payload.paymentNotes = paymentNotes;
      }

      console.log("📤 Updating payment status:", {
        orderId,
        newPaymentStatus,
        notes: paymentNotes,
      });

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/delivery-boy/orders/${orderId}/payment-status`,
        payload,
        { timeout: 10000 }
      );

      if (response.data.success) {
        toast.success(`Payment status updated to ${newPaymentStatus}`);
        setShowPaymentModal(false);
        setSelectedOrderForPayment(null);
        setPaymentNotes("");
        fetchOrders(filters, pagination.currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      const message =
        error.response?.data?.message || "Failed to update payment status";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);

      const payload = {
        orderStatus: newStatus,
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/delivery-boy/orders/${orderId}/status`,
        payload,
        { timeout: 10000 }
      );

      if (response.data.success) {
        toast.success(`Order updated to ${newStatus}`);
        setEditingOrder(null);
        fetchOrders(filters, pagination.currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      const message = error.response?.data?.message || "Failed to update order";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // ✅ Handle search with debouncing
  const handleSearchChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchOrders({ ...filters, search: value }, 1);
    }, 500);
  };

  // ✅ Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // ✅ NEW: Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // ✅ Authorization check
  if (!isAuthenticated || !user?.isDeliveryBoy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need to be a delivery boy to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Delivery Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome, {user?.name}
              </p>
            </div>
            <button
              onClick={() => {
                fetchOrders(filters, pagination.currentPage);
                fetchStats();
              }}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <FiPackage className="h-6 w-6 text-blue-600" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Total Assigned
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalAssigned}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
              <div className="flex items-center">
                <FiClock className="h-6 w-6 text-blue-600" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Processing
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.processing}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
              <div className="flex items-center">
                <FiTruck className="h-6 w-6 text-purple-600" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">Shipped</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.shipped}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
              <div className="flex items-center">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.delivered}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => {
                const newFilters = { ...filters, status: e.target.value };
                setFilters(newFilters);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
                fetchOrders(newFilters, 1);
              }}
              disabled={loading}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100"
            >
              <option value="">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFilters({ search: "", status: "" });
                fetchOrders({ search: "", status: "" }, 1);
              }}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading && orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders assigned
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for new deliveries.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 flex-wrap gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id?.slice(-8)}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                        {/* ✅ NEW: Payment status badge */}
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          <FiDollarSign className="h-3 w-3 mr-1" />
                          {order.paymentStatus}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 mr-2" />
                          <span className="font-medium">
                            {order.shippingAddress?.fullName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FiPhone className="h-4 w-4 mr-2" />
                          <a
                            href={`tel:${order.shippingAddress?.phone}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {order.shippingAddress?.phone}
                          </a>
                        </div>
                        <div className="flex items-start">
                          <FiMapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                          <span>
                            {order.shippingAddress?.address},{" "}
                            {order.shippingAddress?.city}
                            <br />
                            {order.shippingAddress?.state} -{" "}
                            {order.shippingAddress?.pincode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 flex items-center space-x-2">
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {expandedOrders.has(order._id) ? (
                          <FiChevronUp className="h-5 w-5" />
                        ) : (
                          <FiChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrders.has(order._id) && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {order.orderItems?.map((item, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Qty: {item.quantity}
                                    {item.size && ` | Size: ${item.size}`}
                                    {item.color && ` | Color: ${item.color}`}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 ml-2">
                                  ₹
                                  {(
                                    item.quantity * item.price
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Order Details
                        </h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal:</span>
                            <span className="text-gray-900">
                              ₹
                              {(
                                order.totalPrice -
                                order.shippingPrice -
                                order.taxPrice
                              )?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Shipping:</span>
                            <span className="text-gray-900">
                              ₹{order.shippingPrice?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax:</span>
                            <span className="text-gray-900">
                              ₹{order.taxPrice?.toLocaleString()}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-green-600">
                              ₹{order.totalPrice?.toLocaleString()}
                            </span>
                          </div>

                          {/* ✅ NEW: Payment Method Display */}
                          <div className="border-t border-gray-200 pt-3">
                            <p className="text-xs text-gray-500 mb-1">
                              PAYMENT METHOD
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.paymentMethod === "COD"
                                ? "💵 Cash on Delivery"
                                : order.paymentMethodName || "Online Payment"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Status History
                        </h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                          {order.statusHistory
                            .slice()
                            .reverse()
                            .map((entry, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {entry.status}
                                  </span>
                                  <span className="text-gray-500 ml-2">
                                    by {entry.updatedByName}
                                  </span>
                                </div>
                                <span className="text-gray-500">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Update Section */}
                <div className="border-t border-gray-200 p-6 bg-blue-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Update Status
                  </h4>

                  <div className="space-y-4">
                    {/* Order Status Update */}
                    {getNextStatus(order.orderStatus) && (
                      <div>
                        <button
                          onClick={() => {
                            setEditingOrder(order._id);
                            handleStatusUpdate(
                              order._id,
                              getNextStatus(order.orderStatus)
                            );
                          }}
                          disabled={loading || editingOrder === order._id}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading && editingOrder === order._id ? (
                            <span className="flex items-center">
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
                              Updating...
                            </span>
                          ) : (
                            <>
                              <FiEdit3 className="mr-2 h-4 w-4" />
                              Update to {getNextStatus(order.orderStatus)}
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* ✅ NEW: Payment Status Update Button (for COD & Pending payments) */}
                    {order.paymentMethod === "COD" &&
                      order.paymentStatus === "pending" && (
                        <div>
                          <button
                            onClick={() => {
                              setSelectedOrderForPayment(order);
                              setPaymentNotes("");
                              setShowPaymentModal(true);
                            }}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiDollarSign className="mr-2 h-4 w-4" />
                            Confirm Payment Received (₹
                            {order.totalPrice?.toLocaleString()})
                          </button>
                        </div>
                      )}

                    {/* Delivered Message */}
                    {order.orderStatus === "delivered" && (
                      <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Order successfully delivered on{" "}
                          {order.deliveredAt
                            ? new Date(order.deliveredAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Payment Complete Message */}
                    {order.paymentStatus === "completed" && (
                      <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Payment confirmed on{" "}
                          {order.paidAt
                            ? new Date(order.paidAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    )}

                    {/* No more transitions message */}
                    {!getNextStatus(order.orderStatus) &&
                      order.orderStatus !== "delivered" && (
                        <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            No further actions available for this order.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mt-6 gap-4">
            <div className="text-sm text-gray-500">
              Showing{" "}
              {Math.min(
                (pagination.currentPage - 1) * pagination.limit + 1,
                pagination.totalOrders
              )}{" "}
              to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalOrders
              )}{" "}
              of {pagination.totalOrders} orders
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newPage = pagination.currentPage - 1;
                  setPagination((prev) => ({ ...prev, currentPage: newPage }));
                  fetchOrders(filters, newPage);
                }}
                disabled={pagination.currentPage <= 1 || loading}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600 px-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => {
                  const newPage = pagination.currentPage + 1;
                  setPagination((prev) => ({ ...prev, currentPage: newPage }));
                  fetchOrders(filters, newPage);
                }}
                disabled={
                  pagination.currentPage >= pagination.totalPages || loading
                }
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ NEW: Payment Status Modal */}
      {showPaymentModal && selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Payment Received
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Order #{selectedOrderForPayment._id.slice(-6)}
              </p>

              {/* Payment Amount */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-700 mb-1">Amount Received</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{selectedOrderForPayment.totalPrice?.toLocaleString()}
                </p>
              </div>

              {/* Payment Method */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-blue-700 mb-1">
                  PAYMENT METHOD
                </p>
                <p className="text-sm text-blue-900">
                  💵 Cash on Delivery (COD)
                </p>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Add any notes about payment collection..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedOrderForPayment(null);
                  setPaymentNotes("");
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handlePaymentStatusUpdate(
                    selectedOrderForPayment._id,
                    "completed"
                  )
                }
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? (
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
                    Confirming...
                  </>
                ) : (
                  <>
                    <FiDollarSign className="mr-2 h-4 w-4" />
                    Confirm Payment
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

export default DeliveryBoyDashboard;
