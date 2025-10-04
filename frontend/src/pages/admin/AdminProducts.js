import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiUpload,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiPackage,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi";

const AdminProducts = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      subCategory: "",
      sizes: "",
      colors: "",
      images: "",
      stock: "",
      bestseller: false,
      featured: false,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set([0]));

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate("/");
      return;
    }
    fetchStats();
  }, [isAuthenticated, user, navigate]);

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

  const toggleRowExpansion = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const addProductRow = () => {
    const newIndex = products.length;
    setProducts([
      ...products,
      {
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        subCategory: "",
        sizes: "",
        colors: "",
        images: "",
        stock: "",
        bestseller: false,
        featured: false,
      },
    ]);
    setExpandedRows(new Set([...expandedRows, newIndex]));
  };

  const removeProductRow = (index) => {
    if (products.length > 1) {
      const newProducts = products.filter((_, i) => i !== index);
      setProducts(newProducts);
      const newExpanded = new Set(expandedRows);
      newExpanded.delete(index);
      setExpandedRows(newExpanded);
    }
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleBulkSave = async () => {
    try {
      setLoading(true);

      const validProducts = products.filter(
        (product) => product.name && product.price && product.category
      );

      if (validProducts.length === 0) {
        toast.error("Please fill at least one complete product");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/products/bulk-create`,
        { products: validProducts }
      );

      if (response.data.success) {
        toast.success(`Successfully created ${validProducts.length} products!`);
        setProducts([
          {
            name: "",
            description: "",
            price: "",
            originalPrice: "",
            category: "",
            subCategory: "",
            sizes: "",
            colors: "",
            images: "",
            stock: "",
            bestseller: false,
            featured: false,
          },
        ]);
        setExpandedRows(new Set([0]));
        fetchStats();
      }
    } catch (error) {
      console.error("Error creating products:", error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join("\n");
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || "Error creating products");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: "Example T-Shirt",
        description: "Comfortable cotton t-shirt",
        price: "599",
        originalPrice: "799",
        category: "Men",
        subCategory: "Shirts",
        sizes: "S,M,L,XL",
        colors: "Red,Blue,Black",
        images: "https://example.com/image1.jpg,https://example.com/image2.jpg",
        stock: "50",
        bestseller: false,
        featured: true,
      },
    ];

    const dataStr = JSON.stringify(template, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "products-template.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleJSONImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (Array.isArray(jsonData)) {
          setProducts(
            jsonData.map((item) => ({
              name: item.name || "",
              description: item.description || "",
              price: item.price || "",
              originalPrice: item.originalPrice || "",
              category: item.category || "",
              subCategory: item.subCategory || "",
              sizes: Array.isArray(item.sizes)
                ? item.sizes.join(",")
                : item.sizes || "",
              colors: Array.isArray(item.colors)
                ? item.colors.join(",")
                : item.colors || "",
              images: Array.isArray(item.images)
                ? item.images.join(",")
                : item.images || "",
              stock: item.stock || "",
              bestseller: Boolean(item.bestseller),
              featured: Boolean(item.featured),
            }))
          );
          setExpandedRows(new Set(jsonData.map((_, index) => index)));
          toast.success(`Loaded ${jsonData.length} products from JSON`);
        } else {
          toast.error("Invalid JSON format. Expected an array of products.");
        }
      } catch (error) {
        toast.error("Error parsing JSON file");
      }
    };
    reader.readAsText(file);
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

  const validProductsCount = products.filter(
    (p) => p.name && p.price && p.category
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Product Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Add and manage your products efficiently
              </p>
            </div>
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

        {/* Action Bar */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addProductRow}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Product
            </button>

            <button
              onClick={handleBulkSave}
              disabled={loading || validProductsCount === 0}
              className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : `Save All (${validProductsCount})`}
            </button>

            <button
              onClick={downloadTemplate}
              className="flex-1 sm:flex-none bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
            >
              <FiDownload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download Template</span>
              <span className="sm:hidden">Template</span>
            </button>

            <label className="flex-1 sm:flex-none bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center font-medium cursor-pointer">
              <FiUpload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import JSON</span>
              <span className="sm:hidden">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Product Cards */}
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {/* Card Header */}
              <div
                className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleRowExpansion(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name || `Product ${index + 1}`}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      {product.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      )}
                      {product.price && (
                        <span className="font-semibold text-green-600">
                          ₹{product.price}
                        </span>
                      )}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProductRow(index);
                      }}
                      disabled={products.length === 1}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                    {expandedRows.has(index) ? (
                      <FiChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              {expandedRows.has(index) && (
                <div className="border-t border-gray-200 p-4 sm:p-6 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) =>
                            updateProduct(index, "name", e.target.value)
                          }
                          placeholder="Enter product name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={product.category}
                          onChange={(e) =>
                            updateProduct(index, "category", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          value={product.description}
                          onChange={(e) =>
                            updateProduct(index, "description", e.target.value)
                          }
                          placeholder="Product description"
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Pricing & Inventory
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price *
                        </label>
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) =>
                            updateProduct(index, "price", e.target.value)
                          }
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Original Price
                        </label>
                        <input
                          type="number"
                          value={product.originalPrice}
                          onChange={(e) =>
                            updateProduct(
                              index,
                              "originalPrice",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) =>
                            updateProduct(index, "stock", e.target.value)
                          }
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sub Category
                        </label>
                        <input
                          type="text"
                          value={product.subCategory}
                          onChange={(e) =>
                            updateProduct(index, "subCategory", e.target.value)
                          }
                          placeholder="Sub category"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Variants
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sizes
                        </label>
                        <input
                          type="text"
                          value={product.sizes}
                          onChange={(e) =>
                            updateProduct(index, "sizes", e.target.value)
                          }
                          placeholder="S,M,L,XL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          value={product.colors}
                          onChange={(e) =>
                            updateProduct(index, "colors", e.target.value)
                          }
                          placeholder="Red,Blue,Black"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Separate with commas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <FiImage className="mr-2 h-4 w-4" />
                      Product Images
                    </h4>
                    <textarea
                      value={product.images}
                      onChange={(e) =>
                        updateProduct(index, "images", e.target.value)
                      }
                      placeholder="https://example.com/image1.jpg,https://example.com/image2.jpg"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Image URLs separated by commas
                    </p>
                  </div>

                  {/* Flags */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Options
                    </h4>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={product.bestseller}
                          onChange={(e) =>
                            updateProduct(index, "bestseller", e.target.checked)
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
                          checked={product.featured}
                          onChange={(e) =>
                            updateProduct(index, "featured", e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Featured
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Quick Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                Required Fields
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Product Name</li>
                <li>• Price</li>
                <li>• Category</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Tips</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Use commas to separate sizes, colors, and image URLs</li>
                <li>• Click on product cards to expand/collapse details</li>
                <li>• Download template for JSON import format</li>
                <li>• Only complete products will be saved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
