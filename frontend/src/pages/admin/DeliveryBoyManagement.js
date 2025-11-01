import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiUser,
  FiPhone,
  FiTruck,
  FiCheck,
  FiX,
  FiSearch,
  FiRefreshCw,
  FiEdit3,
  FiTrash2,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";

const DeliveryBoyManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // verify, edit, status, rating
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);

  const [formData, setFormData] = useState({
    documentsVerified: false,
    phoneVerified: false,
    vehicleNumber: "",
    licenseNumber: "",
    assignedArea: "",
    status: "",
    rating: 0,
  });

  const searchTimeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDeliveryBoys: 0,
  });

  // Fetch on mount
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchDeliveryBoys();
      fetchStats();
    }
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchDeliveryBoys = async (
    currentFilters = filters,
    currentPage = 1
  ) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: currentFilters.limit,
        search: currentFilters.search,
        status: currentFilters.status,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/delivery-boys?${queryParams}`,
        { timeout: 10000 }
      );

      if (response.data.success) {
        setDeliveryBoys(response.data.deliveryBoys);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
      toast.error("Failed to fetch delivery boys");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/delivery-boys/stats`,
        { timeout: 10000 }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchDeliveryBoys({ ...filters, search: value }, 1);
    }, 500);
  };

  const openModal = (type, deliveryBoy) => {
    setModalType(type);
    setSelectedDeliveryBoy(deliveryBoy);

    switch (type) {
      case "verify":
        setFormData({
          documentsVerified:
            deliveryBoy.deliveryDetails?.documentsVerified || false,
          phoneVerified: deliveryBoy.deliveryDetails?.phoneVerified || false,
        });
        break;
      case "edit":
        setFormData({
          vehicleNumber: deliveryBoy.deliveryDetails?.vehicleNumber || "",
          licenseNumber: deliveryBoy.deliveryDetails?.licenseNumber || "",
          assignedArea: deliveryBoy.deliveryDetails?.assignedArea || "",
        });
        break;
      case "status":
        setFormData({
          status: deliveryBoy.deliveryDetails?.status || "",
        });
        break;
      case "rating":
        setFormData({
          rating: deliveryBoy.deliveryDetails?.rating || 0,
        });
        break;
      default:
        break;
    }

    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    try {
      setLoading(true);

      let response;
      const deliveryBoyId = selectedDeliveryBoy._id;

      switch (modalType) {
        case "verify":
          response = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/admin/delivery-boys/${deliveryBoyId}/verify`,
            {
              documentsVerified: formData.documentsVerified,
              phoneVerified: formData.phoneVerified,
            },
            { timeout: 10000 }
          );
          break;
        case "edit":
          response = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/admin/delivery-boys/${deliveryBoyId}/details`,
            {
              vehicleNumber: formData.vehicleNumber,
              licenseNumber: formData.licenseNumber,
              assignedArea: formData.assignedArea,
            },
            { timeout: 10000 }
          );
          break;
        case "status":
          response = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/admin/delivery-boys/${deliveryBoyId}/status`,
            {
              status: formData.status,
            },
            { timeout: 10000 }
          );
          break;
        case "rating":
          response = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/admin/delivery-boys/${deliveryBoyId}/rating`,
            {
              rating: formData.rating,
            },
            { timeout: 10000 }
          );
          break;
        default:
          return;
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setShowModal(false);
        fetchDeliveryBoys(filters, pagination.currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating delivery boy:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deliveryBoyId) => {
    if (!window.confirm("Are you sure you want to delete this delivery boy?")) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/delivery-boys/${deliveryBoyId}`,
        { timeout: 10000 }
      );

      if (response.data.success) {
        toast.success("Delivery boy deleted successfully");
        fetchDeliveryBoys(filters, pagination.currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                Delivery Boy Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage delivery boy accounts, verification, and assignments
              </p>
            </div>
            <button
              onClick={() => {
                fetchDeliveryBoys(filters, pagination.currentPage);
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
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <FiUser className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalDeliveryBoys}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
              <div className="flex items-center">
                <FiCheck className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeDeliveryBoys}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
              <div className="flex items-center">
                <FiAlertCircle className="h-6 w-6 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Inactive</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.inactiveDeliveryBoys}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
              <div className="flex items-center">
                <FiX className="h-6 w-6 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.suspendedDeliveryBoys}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
              <div className="flex items-center">
                <FiCheck className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Verified</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.verifiedDeliveryBoys}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
              <div className="flex items-center">
                <FiAlertCircle className="h-6 w-6 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.pendingVerificationDeliveryBoys}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                }));
                fetchDeliveryBoys({ ...filters, status: e.target.value }, 1);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFilters({
                  search: "",
                  status: "",
                  page: 1,
                  limit: 10,
                });
                fetchDeliveryBoys(
                  { search: "", status: "", page: 1, limit: 10 },
                  1
                );
              }}
              className="bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Delivery Boys List */}
        <div className="space-y-4">
          {loading && deliveryBoys.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading delivery boys...</p>
            </div>
          ) : deliveryBoys.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <FiTruck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No delivery boys found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            deliveryBoys.map((deliveryBoy) => (
              <div
                key={deliveryBoy._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {deliveryBoy.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            deliveryBoy.deliveryDetails?.status
                          )}`}
                        >
                          {deliveryBoy.deliveryDetails?.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiPhone className="h-4 w-4 mr-2" />
                          {deliveryBoy.phone}
                        </div>
                        <div className="flex items-center">
                          <FiMapPin className="h-4 w-4 mr-2" />
                          {deliveryBoy.deliveryDetails?.assignedArea || "N/A"}
                        </div>
                        <div className="flex items-center">
                          <FiStar className="h-4 w-4 mr-2 text-yellow-500" />
                          {deliveryBoy.deliveryDetails?.rating || 0} / 5
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === deliveryBoy._id
                            ? null
                            : deliveryBoy._id
                        )
                      }
                      className="ml-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      {expandedId === deliveryBoy._id ? (
                        <FiChevronUp className="h-5 w-5" />
                      ) : (
                        <FiChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Verification Status */}
                  <div className="flex space-x-4 text-xs">
                    <div
                      className={`flex items-center px-2 py-1 rounded ${
                        deliveryBoy.deliveryDetails?.documentsVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <FiFileText className="mr-1 h-3 w-3" />
                      Documents:{" "}
                      {deliveryBoy.deliveryDetails?.documentsVerified
                        ? "✓"
                        : "✗"}
                    </div>
                    <div
                      className={`flex items-center px-2 py-1 rounded ${
                        deliveryBoy.deliveryDetails?.phoneVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <FiPhone className="mr-1 h-3 w-3" />
                      Phone:{" "}
                      {deliveryBoy.deliveryDetails?.phoneVerified ? "✓" : "✗"}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === deliveryBoy._id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                    {/* Personal Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Personal Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Name</p>
                          <p className="font-medium text-gray-900">
                            {deliveryBoy.name}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <p className="font-medium text-gray-900">
                            {deliveryBoy.email}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Phone</p>
                          <p className="font-medium text-gray-900">
                            {deliveryBoy.phone}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="font-medium text-gray-900">
                            {deliveryBoy.address?.city || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <FiTruck className="mr-2 h-4 w-4" />
                        Delivery Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            Vehicle Number
                          </p>
                          <p className="font-medium text-gray-900">
                            {deliveryBoy.deliveryDetails?.vehicleNumber ||
                              "N/A"}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            License Number
                          </p>
                          <p className="font-medium text-gray-900">
                            {deliveryBoy.deliveryDetails?.licenseNumber ||
                              "N/A"}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Area</p>
                          <p className="font-medium text-gray-900">
                            {deliveryBoy.deliveryDetails?.assignedArea || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Performance Metrics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            Total Deliveries
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {deliveryBoy.deliveryDetails?.totalDeliveries || 0}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            Successful
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {deliveryBoy.deliveryDetails
                              ?.successfulDeliveries || 0}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Rating</p>
                          <p className="text-lg font-bold text-yellow-500">
                            {deliveryBoy.deliveryDetails?.rating || 0} / 5
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            Join Date
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              deliveryBoy.deliveryDetails?.joinDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-200 p-6 bg-blue-50 flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal("verify", deliveryBoy)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FiCheck className="mr-2 h-4 w-4" />
                    Verify
                  </button>

                  <button
                    onClick={() => openModal("edit", deliveryBoy)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <FiEdit3 className="mr-2 h-4 w-4" />
                    Edit Details
                  </button>

                  <button
                    onClick={() => openModal("status", deliveryBoy)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <FiUser className="mr-2 h-4 w-4" />
                    Change Status
                  </button>

                  <button
                    onClick={() => openModal("rating", deliveryBoy)}
                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    <FiStar className="mr-2 h-4 w-4" />
                    Set Rating
                  </button>

                  <button
                    onClick={() => handleDelete(deliveryBoy._id)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm ml-auto"
                  >
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mt-6">
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const newPage = pagination.currentPage - 1;
                  fetchDeliveryBoys(filters, newPage);
                }}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              <button
                onClick={() => {
                  const newPage = pagination.currentPage + 1;
                  fetchDeliveryBoys(filters, newPage);
                }}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {modalType === "verify" && "Verify Documents"}
                {modalType === "edit" && "Edit Delivery Details"}
                {modalType === "status" && "Change Status"}
                {modalType === "rating" && "Set Rating"}
              </h3>

              {/* Verify Modal */}
              {modalType === "verify" && (
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.documentsVerified}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          documentsVerified: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Documents Verified
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.phoneVerified}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phoneVerified: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Phone Verified
                    </span>
                  </label>
                </div>
              )}

              {/* Edit Details Modal */}
              {modalType === "edit" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Vehicle Number"
                    value={formData.vehicleNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vehicleNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="License Number"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        licenseNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Assigned Area"
                    value={formData.assignedArea}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignedArea: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Status Modal */}
              {modalType === "status" && (
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              )}

              {/* Rating Modal */}
              {modalType === "rating" && (
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyManagement;
