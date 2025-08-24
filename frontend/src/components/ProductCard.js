import React from "react";
import { Link } from "react-router-dom";
import { FiStar, FiHeart } from "react-icons/fi";

const ProductCard = ({ product }) => {
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images[0] || "/placeholder-image.jpg"}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.bestseller && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Bestseller
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
          <FiHeart className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-1">
            ({product.numReviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="mt-2">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600">Sizes:</span>
            {product.sizes.slice(0, 3).map((size) => (
              <span
                key={size}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-xs text-gray-500">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
