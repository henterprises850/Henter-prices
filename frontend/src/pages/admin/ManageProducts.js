import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiEdit3,
  FiTrash2,
  FiSave,
  FiX,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiPackage,
  FiTrendingUp,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";

const ManageProducts = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filtering and pagination states
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    subCategory: "",
    sort: "newest",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 10,
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate("/");
      return;
    }
    fetchProducts();
    fetchStats();
  }, [isAuthenticated, user, navigate, filters, pagination.currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products?${queryParams}`
      );

      if (response.data.success) {
        setProducts(response.data.products);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          totalProducts: response.data.pagination.totalProducts,
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products/admin/stats`
      );
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(",")
        : product.sizes || "",
      colors: Array.isArray(product.colors)
        ? product.colors.join(",")
        : product.colors || "",
      images: Array.isArray(product.images)
        ? product.images.join(",")
        : product.images || "",
    });
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    try {
      setLoading(true);

      const formattedProduct = {
        ...editingProduct,
        sizes: editingProduct.sizes
          ? editingProduct.sizes.split(",").map((s) => s.trim())
          : [],
        colors: editingProduct.colors
          ? editingProduct.colors.split(",").map((c) => c.trim())
          : [],
        images: editingProduct.images
          ? editingProduct.images.split(",").map((img) => img.trim())
          : [],
        price: parseFloat(editingProduct.price) || 0,
        originalPrice: editingProduct.originalPrice
          ? parseFloat(editingProduct.originalPrice)
          : null,
        stock: parseInt(editingProduct.stock) || 0,
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/products/${editingProduct._id}`,
        formattedProduct
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        setEditingProduct(null);
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/products/${productId}`
      );

      if (response.data.success) {
        toast.success("Product deleted successfully!");
        setDeleteConfirm(null);
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (productId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  const updateEditingProduct = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const goToPage = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need admin privileges to access this page.
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
                Manage Products
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Edit, delete, and manage your existing products
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/products")}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiPackage className="mr-2 h-4 w-4" />
              Add New Products
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiPackage className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Total Products
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {stats.totalProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiPackage className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Categories
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {stats.totalCategories}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiTrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Out of Stock
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">
                    {stats.outOfStock}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiStar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Featured
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {stats.featuredProducts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Accessories">Accessories</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <button
              onClick={fetchProducts}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <FiRefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {loading && products.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding some products.
              </p>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                {/* Product Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleRowExpansion(product._id)}
                    >
                      <div className="flex items-center space-x-4">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FiImage className="h-6 w-6 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.category}
                            </span>
                            {product.subCategory && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {product.subCategory}
                              </span>
                            )}
                            <span className="font-semibold text-green-600">
                              ₹{product.price}
                            </span>
                            <span className="text-gray-400">
                              Stock: {product.stock}
                            </span>
                            {product.bestseller && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Bestseller
                              </span>
                            )}
                            {product.featured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirm(product)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>

                      {expandedRows.has(product._id) ? (
                        <FiChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Product Details */}
                {expandedRows.has(product._id) && (
                  <div className="border-t border-gray-200 p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-gray-600">
                          {product.description || "No description"}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Variants
                        </h4>
                        <div className="space-y-1">
                          {product.sizes && product.sizes.length > 0 && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Sizes:</span>{" "}
                              {product.sizes.join(", ")}
                            </p>
                          )}
                          {product.colors && product.colors.length > 0 && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Colors:</span>{" "}
                              {product.colors.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Pricing
                        </h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Current Price:</span>{" "}
                            ₹{product.price}
                          </p>
                          {product.originalPrice && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Original Price:
                              </span>{" "}
                              ₹{product.originalPrice}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Rating:</span>{" "}
                            {product.rating || 0}/5 ({product.numReviews || 0}{" "}
                            reviews)
                          </p>
                        </div>
                      </div>
                    </div>

                    {product.images && product.images.length > 1 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Images
                        </h4>
                        <div className="flex gap-2 overflow-x-auto">
                          {product.images.slice(1).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${product.name} ${index + 2}`}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mt-6">
            <div className="flex items-center text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalProducts
              )}{" "}
              of {pagination.totalProducts} products
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>

              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    pagination.currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Product
                </h2>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) =>
                        updateEditingProduct("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        updateEditingProduct("category", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) =>
                        updateEditingProduct("description", e.target.value)
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pricing & Inventory
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        updateEditingProduct("price", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price
                    </label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice}
                      onChange={(e) =>
                        updateEditingProduct("originalPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        updateEditingProduct("stock", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category
                    </label>
                    <input
                      type="text"
                      value={editingProduct.subCategory}
                      onChange={(e) =>
                        updateEditingProduct("subCategory", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Variants
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sizes
                    </label>
                    <input
                      type="text"
                      value={editingProduct.sizes}
                      onChange={(e) =>
                        updateEditingProduct("sizes", e.target.value)
                      }
                      placeholder="S,M,L,XL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate with commas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colors
                    </label>
                    <input
                      type="text"
                      value={editingProduct.colors}
                      onChange={(e) =>
                        updateEditingProduct("colors", e.target.value)
                      }
                      placeholder="Red,Blue,Black"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate with commas
                    </p>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Images
                </h3>
                <textarea
                  value={editingProduct.images}
                  onChange={(e) =>
                    updateEditingProduct("images", e.target.value)
                  }
                  placeholder="https://example.com/image1.jpg,https://example.com/image2.jpg"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Image URLs separated by commas
                </p>
              </div>

              {/* Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Options
                </h3>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.bestseller}
                      onChange={(e) =>
                        updateEditingProduct("bestseller", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Bestseller
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured}
                      onChange={(e) =>
                        updateEditingProduct("featured", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <FiSave className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiTrash2 className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Product
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Are you sure you want to delete "
                    <strong>{deleteConfirm.name}</strong>"? This action cannot
                    be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm._id)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                {loading ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
