import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FiStar,
  FiShoppingCart,
  FiHeart,
  FiTruck,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Set default selections when product is loaded
  useEffect(() => {
    if (product) {
      // Set default size to first available size
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }

      // Set default color to first available color
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products/${id}`
      );
      const productData = response.data.product;
      setProduct(productData);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }

    console.log("Adding to cart:", {
      product: product.name,
      selectedSize,
      selectedColor,
      quantity,
    });

    addToCart(product, selectedSize, selectedColor, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="bg-gray-300 h-96 rounded-lg mb-4"></div>
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-300 h-20 w-20 rounded"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-300 h-8 rounded"></div>
                <div className="bg-gray-300 h-6 rounded w-3/4"></div>
                <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                <div className="bg-gray-300 h-32 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h2>
          <Link
            to="/products"
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-700 hover:text-primary-600">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <Link
                  to="/products"
                  className="ml-1 text-gray-700 hover:text-primary-600 md:ml-2"
                >
                  Products
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <img
                src={product.images[selectedImage] || "/placeholder-image.jpg"}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                    selectedImage === index
                      ? "border-primary-600"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {product.bestseller && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold mb-2">
                  Bestseller
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {product.rating} ({product.numReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Size:{" "}
                    <span className="text-primary-600">{selectedSize}</span>
                  </h3>
                  <div className="flex space-x-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md transition-colors ${
                          selectedSize === size
                            ? "border-primary-600 bg-primary-50 text-primary-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Color:{" "}
                    <span className="text-primary-600">{selectedColor}</span>
                  </h3>
                  <div className="flex space-x-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-md transition-colors ${
                          selectedColor === color
                            ? "border-primary-600 bg-primary-50 text-primary-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Quantity
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border border-gray-300 rounded-md">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {product.stock} items available
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors">
                  <FiHeart className="h-5 w-5" />
                </button>
              </div>

              {/* Features */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center">
                    <FiTruck className="h-5 w-5 text-primary-600 mr-3" />
                    <span className="text-sm text-gray-700">
                      Free shipping on orders above ₹999
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiRefreshCw className="h-5 w-5 text-primary-600 mr-3" />
                    <span className="text-sm text-gray-700">
                      30 days return policy
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiShield className="h-5 w-5 text-primary-600 mr-3" />
                    <span className="text-sm text-gray-700">
                      100% secure payments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
