import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import {
  FiArrowRight,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";

const Home = () => {
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [bestsellerResponse, latestResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/products/bestseller`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/products/latest`),
      ]);

      setBestsellerProducts(bestsellerResponse.data.products);
      setLatestProducts(latestResponse.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fashion That Speaks
              <span className="block text-yellow-300">Your Language</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover the latest trends in clothing for men, women & kids
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Shop Now
                <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/products?bestseller=true"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center"
              >
                View Bestsellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiTruck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">
                Free shipping on orders above ₹999
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiShield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure payment gateway</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiRefreshCw className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600">30 days return policy</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiShoppingBag className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">Premium quality guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/products?category=Men"
              className="relative group overflow-hidden rounded-lg"
            >
              <img
                src="/images/men-category.jpg"
                alt="Men's Fashion"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Men's Collection</h3>
                  <p className="text-lg">Discover latest trends</p>
                </div>
              </div>
            </Link>
            <Link
              to="/products?category=Women"
              className="relative group overflow-hidden rounded-lg"
            >
              <img
                src="/images/women-category.jpg"
                alt="Women's Fashion"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    Women's Collection
                  </h3>
                  <p className="text-lg">Fashion that empowers</p>
                </div>
              </div>
            </Link>
            <Link
              to="/products?category=Kids"
              className="relative group overflow-hidden rounded-lg"
            >
              <img
                src="/images/kids-category.jpg"
                alt="Kids Fashion"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Kids Collection</h3>
                  <p className="text-lg">Comfortable & playful</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Bestseller Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Bestseller Products</h2>
            <Link
              to="/products?bestseller=true"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All
              <FiArrowRight className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="bg-gray-300 h-64 rounded mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-3 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellerProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Latest Arrivals</h2>
            <Link
              to="/products?sort=newest"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All
              <FiArrowRight className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="bg-gray-300 h-64 rounded mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-3 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8">
              Subscribe to get special offers, free giveaways, and updates
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button className="bg-yellow-500 text-primary-900 px-6 py-3 rounded-r-lg font-semibold hover:bg-yellow-400 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
