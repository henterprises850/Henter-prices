import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiPackage, FiTruck, FiCheck, FiClock, FiEye } from "react-icons/fi";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching orders from:",
        `${process.env.REACT_APP_API_URL}/api/orders/my-orders`
      );

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/orders/my-orders`
      );

      console.log("Orders response:", response.data);

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Placed":
        return <FiPackage className="h-5 w-5 text-blue-600" />;
      case "Packing":
      case "Shipped":
        return <FiTruck className="h-5 w-5 text-yellow-600" />;
      case "Out for Delivery":
        return <FiTruck className="h-5 w-5 text-orange-600" />;
      case "Delivered":
        return <FiCheck className="h-5 w-5 text-green-600" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed":
        return "text-blue-600 bg-blue-100";
      case "Packing":
        return "text-purple-600 bg-purple-100";
      case "Shipped":
        return "text-yellow-600 bg-yellow-100";
      case "Out for Delivery":
        return "text-orange-600 bg-orange-100";
      case "Delivered":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please Login
            </h2>
            <p className="text-gray-600 mb-8">
              You need to be logged in to view your orders
            </p>
            <Link
              to="/login"
              className="bg-primary-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          <div className="animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="bg-gray-300 h-4 rounded mb-4"></div>
                <div className="bg-gray-300 h-32 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchOrders}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              No orders yet
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              When you place orders, they will appear here
            </p>
            <div className="mt-8">
              <Link
                to="/products"
                className="bg-primary-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Orders ({orders.length})
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">{order.orderStatus}</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Total: ₹{order.totalPrice}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.paymentMethod}{" "}
                      {order.isPaid ? "(Paid)" : "(Pending)"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || "/placeholder-image.jpg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{item.quantity * item.price}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="text-sm text-gray-600">
                    Payment: {order.paymentMethod}
                    {order.paymentResult?.mockPayment && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Mock Payment
                      </span>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    <Link
                      to={`/order/${order._id}`}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors inline-flex items-center"
                    >
                      <FiEye className="mr-1 h-4 w-4" />
                      View Details
                    </Link>
                    {order.orderStatus === "Delivered" && (
                      <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
