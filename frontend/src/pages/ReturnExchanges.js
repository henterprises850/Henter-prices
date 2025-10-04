import React from "react";
import { FiRefreshCw, FiClock, FiCheck, FiX, FiPackage } from "react-icons/fi";

const Returns = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Returns & Exchanges
          </h1>
          <p className="text-xl text-gray-600">
            Easy returns within 30 days of delivery
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiClock className="h-12 w-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              30-Day Window
            </h3>
            <p className="text-gray-600">
              Return or exchange within 30 days of delivery
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiPackage className="h-12 w-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Free Pickup
            </h3>
            <p className="text-gray-600">
              We'll pick up the items from your address
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiRefreshCw className="h-12 w-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Process
            </h3>
            <p className="text-gray-600">
              Refund processed within 7-10 business days
            </p>
          </div>
        </div>

        {/* Return Policy */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Return Policy
          </h2>

          <div className="space-y-4 text-gray-600">
            <p>
              We want you to be completely satisfied with your purchase. If
              you're not happy with your order, you can return or exchange items
              within 30 days of delivery.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Eligible Items
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <FiCheck className="h-5 w-5 text-green-500 mr-2" />
                  Returnable Items
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 ml-7">
                  <li>• Clothing with original tags</li>
                  <li>• Unworn shoes in original box</li>
                  <li>• Unused accessories</li>
                  <li>• Items in original packaging</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <FiX className="h-5 w-5 text-red-500 mr-2" />
                  Non-Returnable Items
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 ml-7">
                  <li>• Undergarments & lingerie</li>
                  <li>• Personalized items</li>
                  <li>• Sale items (marked as final sale)</li>
                  <li>• Items without original tags</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How to Return */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How to Return
          </h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Initiate Return
                </h3>
                <p className="text-gray-600">
                  Login to your account and go to "My Orders" → "Return Items"
                  or call us at +91 98765 43210
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Pack Items
                </h3>
                <p className="text-gray-600">
                  Pack items in original packaging with tags attached. Include
                  the invoice.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Schedule Pickup
                </h3>
                <p className="text-gray-600">
                  Our courier partner will pick up the package from your address
                  within 2-3 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Quality Check & Refund
                </h3>
                <p className="text-gray-600">
                  Once we receive and verify the items, your refund will be
                  processed within 7-10 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Process */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Exchange Process
          </h2>

          <div className="space-y-4 text-gray-600">
            <p>
              Want a different size or color? Exchanges are easy! Follow the
              same return process and mention the item you'd like to exchange
              for in the return form.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Exchange Guidelines:
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Exchanges are subject to stock availability</li>
                <li>• Price difference (if any) will be charged or refunded</li>
                <li>• Exchange processing takes 10-14 business days</li>
                <li>• Only one exchange allowed per item</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Refund Methods */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Refund Methods
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Original Payment Method
              </h3>
              <p className="text-gray-600 text-sm">
                Refunds will be credited back to your original payment method
                (Credit/Debit Card, UPI, Net Banking)
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Processing time: 7-10 business days
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Store Credit</h3>
              <p className="text-gray-600 text-sm">
                Get instant store credit for faster future purchases. Valid for
                1 year from issue date.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Processing time: Instant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
