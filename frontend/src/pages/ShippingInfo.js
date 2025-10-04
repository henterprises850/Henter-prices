import React from "react";
import { FiTruck, FiClock, FiMapPin, FiPackage, FiGlobe } from "react-icons/fi";

const Shipping = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shipping Information
          </h1>
          <p className="text-xl text-gray-600">
            Fast, reliable delivery to your doorstep
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FiTruck className="h-8 w-8 text-primary-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Standard Delivery
              </h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• 5-7 business days</li>
              <li>• Free shipping on orders ₹999+</li>
              <li>• ₹99 shipping fee for orders below ₹999</li>
              <li>• Available across India</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FiClock className="h-8 w-8 text-primary-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Express Delivery
              </h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• 2-3 business days</li>
              <li>• ₹149 shipping fee</li>
              <li>• Available in major cities</li>
              <li>• Priority processing</li>
            </ul>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Delivery Timeline
          </h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Confirmation
                </h3>
                <p className="text-gray-600">
                  Within 2 hours of placing your order
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Processing
                </h3>
                <p className="text-gray-600">
                  1-2 business days for order processing and packaging
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Shipped</h3>
                <p className="text-gray-600">
                  You'll receive tracking information via email and SMS
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delivered</h3>
                <p className="text-gray-600">
                  Your order arrives at your doorstep
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Zones */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Shipping Zones & Charges
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-900">
                    Zone
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-900">
                    Cities/States
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-900">
                    Delivery Time
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-900">
                    Shipping Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Zone 1</td>
                  <td className="border border-gray-200 px-4 py-2">
                    Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune
                  </td>
                  <td className="border border-gray-200 px-4 py-2">2-4 days</td>
                  <td className="border border-gray-200 px-4 py-2">
                    ₹99 (Free above ₹999)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Zone 2</td>
                  <td className="border border-gray-200 px-4 py-2">
                    Other major cities
                  </td>
                  <td className="border border-gray-200 px-4 py-2">4-6 days</td>
                  <td className="border border-gray-200 px-4 py-2">
                    ₹129 (Free above ₹999)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Zone 3</td>
                  <td className="border border-gray-200 px-4 py-2">
                    Remote areas
                  </td>
                  <td className="border border-gray-200 px-4 py-2">6-8 days</td>
                  <td className="border border-gray-200 px-4 py-2">
                    ₹149 (Free above ₹1499)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Important Shipping Information
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              • Orders placed on weekends and public holidays will be processed
              on the next business day
            </li>
            <li>
              • PO Box addresses and military APO/FPO addresses are not
              supported
            </li>
            <li>
              • Delivery times may vary during peak seasons and sales events
            </li>
            <li>• Age verification may be required for certain products</li>
            <li>• Cash on Delivery available for orders up to ₹5000</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
