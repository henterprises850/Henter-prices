import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { FiGrid, FiList, FiFilter } from "react-icons/fi";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    subCategory: searchParams.get("subCategory") || "",
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "newest",
    page: parseInt(searchParams.get("page")) || 1,
  });
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    // Update filters from URL params
    setFilters({
      category: searchParams.get("category") || "",
      subCategory: searchParams.get("subCategory") || "",
      search: searchParams.get("search") || "",
      sort: searchParams.get("sort") || "newest",
      page: parseInt(searchParams.get("page")) || 1,
    });
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products?${params.toString()}`
      );

      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "") params.set(k, v);
    });
    setSearchParams(params);
  };

  const categories = [
    { value: "", label: "All Categories" },
    { value: "Men", label: "Men's Fashion" },
    { value: "Women", label: "Women's Fashion" },
    { value: "Kids", label: "Kids Fashion" },
    { value: "Accessories", label: "Accessories" },
  ];

  const subCategories = [
    { value: "", label: "All Sub-categories" },
    { value: "Topwear", label: "Topwear" },
    { value: "Bottomwear", label: "Bottomwear" },
    { value: "Winterwear", label: "Winterwear" },
    { value: "Shoes", label: "Shoes" },
    { value: "Bags", label: "Bags" },
    { value: "Jewelry", label: "Jewelry" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {filters.search
                ? `Search results for "${filters.search}"`
                : "Products"}
            </h1>
            <p className="text-gray-600 mt-1">
              {pagination.totalProducts || 0} products found
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-category
                </label>
                <select
                  value={filters.subCategory}
                  onChange={(e) =>
                    handleFilterChange("subCategory", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {subCategories.map((subCat) => (
                    <option key={subCat.value} value={subCat.value}>
                      {subCat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setFilters({
                    category: "",
                    subCategory: "",
                    search: "",
                    sort: "newest",
                    page: 1,
                  });
                  setSearchParams({});
                }}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 animate-pulse"
                  >
                    <div className="bg-gray-300 h-64 rounded mb-4"></div>
                    <div className="bg-gray-300 h-4 rounded mb-2"></div>
                    <div className="bg-gray-300 h-3 rounded mb-2"></div>
                    <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex space-x-2">
                      {pagination.hasPrev && (
                        <button
                          onClick={() =>
                            handleFilterChange(
                              "page",
                              pagination.currentPage - 1
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Previous
                        </button>
                      )}

                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 &&
                            page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handleFilterChange("page", page)}
                              className={`px-3 py-2 border rounded-md ${
                                page === pagination.currentPage
                                  ? "bg-primary-600 text-white border-primary-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.currentPage - 2 ||
                          page === pagination.currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 py-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      {pagination.hasNext && (
                        <button
                          onClick={() =>
                            handleFilterChange(
                              "page",
                              pagination.currentPage + 1
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Next
                        </button>
                      )}
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No products found</div>
                <p className="text-gray-400 mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
