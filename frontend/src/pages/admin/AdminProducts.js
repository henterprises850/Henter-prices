import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiSave, FiUpload, FiDownload } from "react-icons/fi";

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

  const addProductRow = () => {
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
  };

  const removeProductRow = (index) => {
    if (products.length > 1) {
      const newProducts = products.filter((_, i) => i !== index);
      setProducts(newProducts);
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

      // Filter out empty products
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
    return <div>Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin - Product Management
          </h1>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Products
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">
                  Categories
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">
                  Out of Stock
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {stats.outOfStock}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Featured</h3>
                <p className="text-2xl font-bold text-green-600">
                  {stats.featuredProducts}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={addProductRow}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Product Row
            </button>
            <button
              onClick={handleBulkSave}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              <FiSave className="mr-2" />
              {loading
                ? "Saving..."
                : `Save All Products (${
                    products.filter((p) => p.name && p.price && p.category)
                      .length
                  })`}
            </button>
            <button
              onClick={downloadTemplate}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
            >
              <FiDownload className="mr-2" />
              Download Template
            </button>
            <label className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center cursor-pointer">
              <FiUpload className="mr-2" />
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Products Form */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name *
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price * / Original
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category *
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sizes (comma separated)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colors (comma separated)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images (URLs, comma separated)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) =>
                          updateProduct(index, "name", e.target.value)
                        }
                        placeholder="Product Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <textarea
                        value={product.description}
                        onChange={(e) =>
                          updateProduct(index, "description", e.target.value)
                        }
                        placeholder="Product Description"
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) =>
                          updateProduct(index, "price", e.target.value)
                        }
                        placeholder="Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      />
                      <input
                        type="number"
                        value={product.originalPrice}
                        onChange={(e) =>
                          updateProduct(index, "originalPrice", e.target.value)
                        }
                        placeholder="Original Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={product.category}
                        onChange={(e) =>
                          updateProduct(index, "category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      >
                        <option value="">Select Category</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                      <input
                        type="text"
                        value={product.subCategory}
                        onChange={(e) =>
                          updateProduct(index, "subCategory", e.target.value)
                        }
                        placeholder="Sub Category"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={product.sizes}
                        onChange={(e) =>
                          updateProduct(index, "sizes", e.target.value)
                        }
                        placeholder="S,M,L,XL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={product.colors}
                        onChange={(e) =>
                          updateProduct(index, "colors", e.target.value)
                        }
                        placeholder="Red,Blue,Black"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <textarea
                        value={product.images}
                        onChange={(e) =>
                          updateProduct(index, "images", e.target.value)
                        }
                        placeholder="Image URLs separated by commas"
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) =>
                          updateProduct(index, "stock", e.target.value)
                        }
                        placeholder="Stock"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={product.bestseller}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                "bestseller",
                                e.target.checked
                              )
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Bestseller</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={product.featured}
                            onChange={(e) =>
                              updateProduct(index, "featured", e.target.checked)
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Featured</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removeProductRow(index)}
                        disabled={products.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Quick Guide:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold">Required Fields:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Product Name</li>
                <li>Price</li>
                <li>Category</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Tips:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Use commas to separate sizes, colors, and image URLs</li>
                <li>Download template for JSON import format</li>
                <li>Add multiple rows for bulk entry</li>
                <li>Save validates all products before creating</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
