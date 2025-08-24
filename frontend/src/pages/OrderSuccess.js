import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FiCheckCircle, FiPackage, FiHome } from "react-icons/fi";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/orders/${orderId}`
      );
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-8">
            <FiCheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order has been received and is
              being processed.
            </p>
            {order?.paymentResult?.mockPayment && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  🧪 This was a mock payment for development testing
                </p>
              </div>
            )}
          </div>

          {order && (
            <div className="mb-8 text-left">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Order ID
                    </p>
                    <p className="text-lg font-mono">#{order._id.slice(-6)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Order Date
                    </p>
                    <p className="text-lg">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Payment Method
                    </p>
                    <p className="text-lg">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Amount
                    </p>
                    <p className="text-lg font-bold">₹{order.totalPrice}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {order.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-600 ml-2">
                            ({item.size}, {item.color}) × {item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="text-gray-700">
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
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-primary-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
            >
              <FiPackage className="mr-2" />
              View All Orders
            </Link>
            <Link
              to="/"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors inline-flex items-center justify-center"
            >
              <FiHome className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
