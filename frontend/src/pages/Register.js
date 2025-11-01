import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiEye,
  FiEyeOff,
  FiTruck,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const Register = () => {
  // User type state - "customer" or "deliveryBoy"
  const [userType, setUserType] = useState("customer");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    // Delivery boy specific fields
    vehicleNumber: "",
    licenseNumber: "",
    assignedArea: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate delivery boy fields if needed
    if (userType === "deliveryBoy") {
      if (
        !formData.vehicleNumber ||
        !formData.licenseNumber ||
        !formData.assignedArea
      ) {
        toast.error("All delivery details are required");
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare user data
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        isDeliveryBoy: userType === "deliveryBoy",
      };

      // Add delivery details if registering as delivery boy
      if (userType === "deliveryBoy") {
        userData.deliveryDetails = {
          vehicleNumber: formData.vehicleNumber,
          licenseNumber: formData.licenseNumber,
          assignedArea: formData.assignedArea,
        };
      }

      const result = await register(userData);

      if (result.success) {
        if (userType === "deliveryBoy") {
          toast.info("Your delivery boy account is pending admin approval");
        }
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Admin Registration Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-semibold">Admin Registration:</span> For
                admin access, please contact the system administrator. Admin
                accounts cannot be self-registered.
              </p>
            </div>
          </div>
        </div>

        {/* User Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            I want to register as:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Option */}
            <button
              type="button"
              onClick={() => setUserType("customer")}
              className={`flex items-center p-4 border-2 rounded-lg transition-all duration-200 ${
                userType === "customer"
                  ? "border-primary-600 bg-primary-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <FiUser
                className={`h-8 w-8 ${
                  userType === "customer" ? "text-primary-600" : "text-gray-400"
                }`}
              />
              <div className="ml-4 text-left">
                <p
                  className={`font-semibold ${
                    userType === "customer"
                      ? "text-primary-700"
                      : "text-gray-900"
                  }`}
                >
                  Customer
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Browse and order products
                </p>
              </div>
              {userType === "customer" && (
                <div className="ml-auto">
                  <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            {/* Delivery Boy Option */}
            <button
              type="button"
              onClick={() => setUserType("deliveryBoy")}
              className={`flex items-center p-4 border-2 rounded-lg transition-all duration-200 ${
                userType === "deliveryBoy"
                  ? "border-primary-600 bg-primary-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <FiTruck
                className={`h-8 w-8 ${
                  userType === "deliveryBoy"
                    ? "text-primary-600"
                    : "text-gray-400"
                }`}
              />
              <div className="ml-4 text-left">
                <p
                  className={`font-semibold ${
                    userType === "deliveryBoy"
                      ? "text-primary-700"
                      : "text-gray-900"
                  }`}
                >
                  Delivery Boy
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Deliver orders to customers
                </p>
              </div>
              {userType === "deliveryBoy" && (
                <div className="ml-auto">
                  <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form
          className="mt-8 space-y-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* Basic Fields - Always Visible */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Delivery Boy Specific Fields - Only Visible When Delivery Boy Selected */}
            {userType === "deliveryBoy" && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiTruck className="mr-2 h-5 w-5 text-primary-600" />
                  Delivery Details
                </h3>

                <div>
                  <label
                    htmlFor="vehicleNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="vehicleNumber"
                    name="vehicleNumber"
                    type="text"
                    required={userType === "deliveryBoy"}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="e.g., MH-01-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required={userType === "deliveryBoy"}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="e.g., DL-1234567890"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="assignedArea"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Service Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="assignedArea"
                    name="assignedArea"
                    type="text"
                    required={userType === "deliveryBoy"}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="e.g., Varanasi, Banaras"
                    value={formData.assignedArea}
                    onChange={handleChange}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Note:</span> Your delivery
                    boy account will be pending admin approval. You'll be
                    notified once your account is verified and activated.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                `Create ${
                  userType === "deliveryBoy" ? "Delivery Boy" : "Customer"
                } Account`
              )}
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{" "}
            <Link
              to="/terms"
              className="text-primary-600 hover:text-primary-500"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-primary-600 hover:text-primary-500"
            >
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
