import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [status, setStatus] = useState("checking"); // checking, success, failed
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    verifyPaymentFromRedirect();
  }, []);

  const verifyPaymentFromRedirect = async () => {
    try {
      // ✅ Get order ID from URL
      const orderId = searchParams.get("orderId");
      const sessionId = searchParams.get("sessionId");

      console.log("🔍 Payment status page loaded with params:", {
        orderId,
        sessionId,
      });

      if (!orderId) {
        throw new Error("Order ID not found");
      }

      // ✅ Verify payment with backend
      console.log("📤 Verifying payment...");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/payment/cashfree/verify/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 15000,
        }
      );

      console.log("📦 Verification response:", response.data);

      if (response.data.success) {
        const { paymentStatus, orderStatus } = response.data;

        if (paymentStatus === "SUCCESS") {
          console.log("✅ PAYMENT VERIFIED AS SUCCESS!");

          // Clear cart
          clearCart();

          // Show success message
          setStatus("success");
          setMessage("✅ Payment successful!");
          toast.success("Payment verified successfully!");

          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 3000);
        } else if (paymentStatus === "PENDING") {
          console.log("⏳ Payment still pending");

          setStatus("pending");
          setMessage("⏳ Payment is being processed. Checking again...");

          // Retry after 3 seconds
          setTimeout(() => {
            verifyPaymentFromRedirect();
          }, 3000);
        } else {
          throw new Error(`Payment status: ${paymentStatus}`);
        }
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("❌ Verification error:", error.message);

      setStatus("failed");
      setMessage(
        error.message || "Payment verification failed. Redirecting to orders..."
      );
      toast.error(error.message || "Payment verification failed");

      // Redirect to orders page after 3 seconds
      setTimeout(() => {
        navigate("/orders", { replace: true });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {/* Status Icon */}
        {status === "checking" && (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          </div>
        )}

        {status === "success" && (
          <div className="mb-6">
            <div className="text-6xl">✅</div>
          </div>
        )}

        {status === "failed" && (
          <div className="mb-6">
            <div className="text-6xl">❌</div>
          </div>
        )}

        {status === "pending" && (
          <div className="mb-6">
            <div className="animate-pulse text-6xl">⏳</div>
          </div>
        )}

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === "checking" && "Verifying Payment"}
          {status === "success" && "Payment Successful"}
          {status === "failed" && "Payment Failed"}
          {status === "pending" && "Processing Payment"}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {/* Additional Info */}
        {status === "checking" && (
          <p className="text-sm text-gray-500">
            Please wait while we verify your payment. This may take a moment...
          </p>
        )}

        {status === "success" && (
          <div className="text-sm text-gray-600 space-y-2">
            <p>Thank you for your purchase!</p>
            <p>Redirecting to home page...</p>
          </div>
        )}

        {status === "failed" && (
          <div className="text-sm text-gray-600 space-y-2">
            <p>Your payment could not be verified.</p>
            <p>Redirecting to orders page...</p>
          </div>
        )}

        {status === "pending" && (
          <div className="text-sm text-gray-600 space-y-2">
            <p>Your payment is still being processed.</p>
            <p>Checking again in a few seconds...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
