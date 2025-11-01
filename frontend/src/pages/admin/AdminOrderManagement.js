import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiDownload,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiMapPin,
  FiRefreshCw,
  FiTrash2,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

const AdminOrderManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedOrderForAssignment, setSelectedOrderForAssignment] =
    useState(null);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  // ✅ NEW: Refund modal states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [refundStatus, setRefundStatus] = useState("");
  const [refundTransactionId, setRefundTransactionId] = useState("");
  const [refundNotes, setRefundNotes] = useState("");

  const searchTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);

  const [filters, setFilters] = useState({
    search: "",
    orderStatus: "",
    paymentStatus: "",
    paymentMethod: "",
    deliveryBoyFilter: "",
    assignmentFilter: "",
    dateFrom: "",
    dateTo: "",
    sort: "newest",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
  });

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchOrders();
      fetchStats();
      fetchDeliveryBoys();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
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

      if (cleanedFilters.assignmentFilter) {
        const assignmentValue = cleanedFilters.assignmentFilter;
        delete cleanedFilters.assignmentFilter;

        if (assignmentValue === "assigned") {
          cleanedFilters.hasDeliveryBoy = "true";
        } else if (assignmentValue === "unassigned") {
          cleanedFilters.hasDeliveryBoy = "false";
        }
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: pagination.limit,
        ...cleanedFilters,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/orders/admin/all?${queryParams}`,
        { timeout: 10000 }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          totalOrders: response.data.pagination.totalOrders,
          currentPage: response.data.pagination.currentPage,
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
        `${process.env.REACT_APP_API_URL}/api/orders/admin/stats`,
        { timeout: 10000 }
      );
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/orders/admin/delivery-boys`,
        { timeout: 10000 }
      );
      if (response.data.success) {
        setDeliveryBoys(response.data.deliveryBoys);
      }
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
    }
  };

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

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));

    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchOrders({ ...filters, [filterName]: value }, 1);
    }, 300);
  };

  const handleStatusUpdate = async (orderId, newStatus, reason) => {
    try {
      setLoading(true);

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/orders/${orderId}/status`,
        {
          orderStatus: newStatus,
          reason: reason || "",
        },
        { timeout: 10000 }
      );

      if (response.data.success) {
        toast.success(`Order updated to ${newStatus}`);
        setEditingOrderId(null);
        setEditingStatus("");
        setStatusReason("");
        fetchOrders(filters, pagination.currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrder = async () => {
    if (!selectedDeliveryBoy) {
      toast.error("Please select a delivery boy");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders/admin/assign`,
        {
          orderId: selectedOrderForAssignment,
          deliveryBoyId: selectedDeliveryBoy,
        },
        { timeout: 10000 }
      );

      if (response.data.success) {
        toast.success("Order assigned successfully");
        setShowAssignmentModal(false);
        setSelectedOrderForAssignment(null);
        setSelectedDeliveryBoy("");
        fetchOrders(filters, pagination.currentPage);
      }
    } catch (error) {
      console.error("Error assigning order:", error);
      toast.error(error.response?.data?.message || "Failed to assign order");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle refund status update
  const handleRefundUpdate = async () => {
    if (!refundStatus) {
      toast.error("Please select a refund status");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/orders/${selectedOrderForRefund._id}/refund`,
        {
          refundStatus,
          refundTransactionId: refundTransactionId || "",
          refundNotes: refundNotes || "",
        },
        { timeout: 10000 }
      );

      if (response.data.success) {
        toast.success("Refund status updated successfully");
        setShowRefundModal(false);
        setSelectedOrderForRefund(null);
        setRefundStatus("");
        setRefundTransactionId("");
        setRefundNotes("");
        fetchOrders(filters, pagination.currentPage);
      }
    } catch (error) {
      console.error("Error updating refund:", error);
      toast.error(error.response?.data?.message || "Failed to update refund");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open refund modal
  const openRefundModal = (order) => {
    setSelectedOrderForRefund(order);
    setRefundStatus(
      order.refundStatus === "not_applicable" ? "pending" : order.refundStatus
    );
    setRefundTransactionId(order.refundTransactionId || "");
    setRefundNotes(order.refundNotes || "");
    setShowRefundModal(true);
  };

  const handleDeleteAllOrders = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/orders/admin/delete-all`,
        {
          data: { confirmPassword: deletePassword },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        toast.success(`Deleted ${response.data.deletedCount} order(s)`);
        setShowDeleteAllModal(false);
        setDeletePassword("");
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
      toast.error(error.response?.data?.message || "Failed to delete orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const exportOrders = () => {
    if (orders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const csvContent = [
      [
        "Order ID",
        "Customer",
        "Email",
        "Phone",
        "Status",
        "Payment",
        "Delivery Boy",
        "Total",
        "Refund Status",
        "Date",
      ],
      ...orders.map((order) => [
        order._id,
        order.user?.name || "N/A",
        order.user?.email || "N/A",
        order.shippingAddress?.phone || "N/A",
        order.orderStatus,
        order.paymentStatus,
        order.assignedDeliveryBoy?.name || "Unassigned",
        order.totalPrice,
        order.refundStatus || "N/A",
        new Date(order.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "order placed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
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

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600";
      case "processing":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need admin access to view this page.
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
                Order Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all customer orders
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <button
                onClick={() => {
                  fetchOrders(filters, pagination.currentPage);
                  fetchStats();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={exportOrders}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => setShowDeleteAllModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <FiPackage className="h-6 w-6 text-blue-600" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
              <div className="flex items-center">
                <FiClock className="h-6 w-6 text-yellow-600" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pendingOrders}
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
                    {stats.shippedOrders}
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
                    {stats.deliveredOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
              <div className="flex items-center">
                <FiDollarSign className="h-6 w-6 text-blue-600" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiFilter className="mr-2 h-5 w-5" />
            Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by Order ID or customer..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Order Status */}
            <select
              value={filters.orderStatus}
              onChange={(e) =>
                handleFilterChange("orderStatus", e.target.value)
              }
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All Order Status</option>
              <option value="pending">Pending</option>
              <option value="Order Placed">Order Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status */}
            <select
              value={filters.paymentStatus}
              onChange={(e) =>
                handleFilterChange("paymentStatus", e.target.value)
              }
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Method */}
            <select
              value={filters.paymentMethod}
              onChange={(e) =>
                handleFilterChange("paymentMethod", e.target.value)
              }
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All Payment Methods</option>
              <option value="COD">Cash on Delivery</option>
              <option value="UPI">UPI</option>
              <option value="Online">Online</option>
              <option value="GooglePay">Google Pay</option>
              <option value="CASHFREE">Cashfree</option>
            </select>

            {/* Assignment Filter */}
            <select
              value={filters.assignmentFilter}
              onChange={(e) =>
                handleFilterChange("assignmentFilter", e.target.value)
              }
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All Assignments</option>
              <option value="assigned">Assigned to Delivery Boy</option>
              <option value="unassigned">Not Assigned</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>

            {/* Date From */}
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* Date To */}
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* Reset Button */}
            <button
              onClick={() => {
                setFilters({
                  search: "",
                  orderStatus: "",
                  paymentStatus: "",
                  paymentMethod: "",
                  deliveryBoyFilter: "",
                  assignmentFilter: "",
                  dateFrom: "",
                  dateTo: "",
                  sort: "newest",
                });
                fetchOrders(
                  {
                    search: "",
                    orderStatus: "",
                    paymentStatus: "",
                    paymentMethod: "",
                    deliveryBoyFilter: "",
                    assignmentFilter: "",
                    dateFrom: "",
                    dateTo: "",
                    sort: "newest",
                  },
                  1
                );
              }}
              className="bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-1"
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
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters
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
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3 flex-wrap gap-2">
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
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          💳 {order.paymentStatus}
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                            order.paymentMethodName
                          )}`}
                        >
                          {order.paymentMethodName}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 mr-2" />
                          <span className="font-medium">
                            {order.user?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FiDollarSign className="h-4 w-4 mr-2" />
                          <span>₹{order.totalPrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Delivery Boy Name in Card */}
                        <div className="flex items-center">
                          <FiTruck className="h-4 w-4 mr-2" />
                          <span className="font-medium">
                            {order.assignedDeliveryBoy?.name || (
                              <span className="text-yellow-600">
                                Unassigned
                              </span>
                            )}
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
                  <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Order Items ({order.orderItems?.length})
                      </h4>
                      <div className="space-y-2">
                        {order.orderItems?.map((item, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Qty: {item.quantity}
                                  {item.size && ` | Size: ${item.size}`}
                                  {item.color && ` | Color: ${item.color}`}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                ₹{(item.quantity * item.price).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <FiMapPin className="mr-2 h-4 w-4" />
                        Shipping Address
                      </h4>
                      <div className="bg-white p-4 rounded-lg text-sm text-gray-600">
                        <p className="font-medium text-gray-900">
                          {order.shippingAddress?.fullName}
                        </p>
                        <p>{order.shippingAddress?.address}</p>
                        <p>
                          {order.shippingAddress?.city},{" "}
                          {order.shippingAddress?.state} -{" "}
                          {order.shippingAddress?.pincode}
                        </p>
                        <p className="mt-2">
                          <strong>Phone:</strong> {order.shippingAddress?.phone}
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Price Breakdown
                      </h4>
                      <div className="bg-white p-4 rounded-lg space-y-2">
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
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                          <span>Total:</span>
                          <span className="text-green-600">
                            ₹{order.totalPrice?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Boy Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <FiTruck className="mr-2 h-4 w-4" />
                        Delivery Boy Details
                      </h4>
                      {order.assignedDeliveryBoy ? (
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <p className="font-medium text-gray-900">
                            {order.assignedDeliveryBoy?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            📞 {order.assignedDeliveryBoy?.phone}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            📍 Area:{" "}
                            {
                              order.assignedDeliveryBoy?.deliveryDetails
                                ?.assignedArea
                            }
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            ⭐ Rating:{" "}
                            {order.assignedDeliveryBoy?.deliveryDetails
                              ?.rating || 0}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800 font-medium">
                            ⚠️ Order not assigned to any delivery boy
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ✅ Refund Section - Show for Cancelled Orders with Completed Payment */}
                    {order.orderStatus === "cancelled" &&
                      order.paymentStatus === "completed" && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <FiDollarSign className="mr-2 h-4 w-4" />
                            Refund Management
                          </h4>
                          <div className="bg-white p-4 rounded-lg border border-amber-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">
                                    Refund Amount:
                                  </span>{" "}
                                  ₹{order.refundAmount?.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Status:</span>{" "}
                                  <span
                                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      order.refundStatus === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : order.refundStatus === "processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {order.refundStatus === "not_applicable"
                                      ? "Pending"
                                      : order.refundStatus}
                                  </span>
                                </p>
                                {order.refundTransactionId && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">
                                      Transaction ID:
                                    </span>{" "}
                                    {order.refundTransactionId}
                                  </p>
                                )}
                                {order.refundCompletedAt && (
                                  <p className="text-sm text-green-600 mt-1">
                                    ✓ Completed on{" "}
                                    {new Date(
                                      order.refundCompletedAt
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Status History */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Status History
                      </h4>
                      <div className="bg-white p-4 rounded-lg space-y-2">
                        {order.statusHistory
                          ?.slice()
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
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-200 p-6 bg-blue-50 space-y-4">
                  {editingOrderId === order._id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Status
                        </label>
                        <select
                          value={editingStatus}
                          onChange={(e) => setEditingStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select status</option>
                          <option value="pending">Pending</option>
                          <option value="Order Placed">Order Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason (Optional)
                        </label>
                        <textarea
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          placeholder="Add a reason for status change..."
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              order._id,
                              editingStatus,
                              statusReason
                            )
                          }
                          disabled={!editingStatus || loading}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Save Status
                        </button>
                        <button
                          onClick={() => {
                            setEditingOrderId(null);
                            setEditingStatus("");
                            setStatusReason("");
                          }}
                          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          setEditingOrderId(order._id);
                          setEditingStatus(order.orderStatus);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <FiEdit3 className="mr-2 h-4 w-4" />
                        Update Status
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrderForAssignment(order._id);
                          setShowAssignmentModal(true);
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                      >
                        <FiTruck className="mr-2 h-4 w-4" />
                        Assign Delivery Boy
                      </button>

                      {/* ✅ Refund Button - Show for Cancelled Orders with Completed Payment */}
                      {order.orderStatus === "cancelled" &&
                        order.paymentStatus === "completed" && (
                          <button
                            onClick={() => openRefundModal(order)}
                            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                          >
                            <FiDollarSign className="mr-2 h-4 w-4" />
                            Update Refund
                          </button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mt-6">
            <div className="text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
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
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: newPage,
                  }));
                  fetchOrders(filters, newPage);
                }}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <button
                onClick={() => {
                  const newPage = pagination.currentPage + 1;
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: newPage,
                  }));
                  fetchOrders(filters, newPage);
                }}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assign Delivery Boy
              </h3>
              <select
                value={selectedDeliveryBoy}
                onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="">Select a delivery boy</option>
                {deliveryBoys.map((boy) => (
                  <option key={boy._id} value={boy._id}>
                    {boy.name} - {boy.deliveryDetails?.assignedArea}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedOrderForAssignment(null);
                  setSelectedDeliveryBoy("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignOrder}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Refund Modal */}
      {showRefundModal && selectedOrderForRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Refund Status
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Order: <strong>#{selectedOrderForRefund._id.slice(-6)}</strong>
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Refund Amount:</strong> ₹
                  {selectedOrderForRefund.totalPrice?.toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Status
                  </label>
                  <select
                    value={refundStatus}
                    onChange={(e) => setRefundStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter refund transaction ID"
                    value={refundTransactionId}
                    onChange={(e) => setRefundTransactionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Add refund notes..."
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedOrderForRefund(null);
                  setRefundStatus("");
                  setRefundTransactionId("");
                  setRefundNotes("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundUpdate}
                disabled={loading || !refundStatus}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center"
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
                    Updating...
                  </>
                ) : (
                  <>
                    <FiDollarSign className="mr-2 h-4 w-4" />
                    Update Refund
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete All Orders?
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                This action cannot be undone. All orders will be permanently
                deleted.
              </p>
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteAllModal(false);
                  setDeletePassword("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllOrders}
                disabled={loading || !deletePassword}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
