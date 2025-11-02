import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { submitPaymentForm } from "sabpaisa-pg-dev";
import { toast } from "react-toastify";

const SabPaisaPaymentForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const sabpaisaDataStr = sessionStorage.getItem("sabpaisaData");

    console.log("🔍 SabPaisa Payment Form Loaded");
    console.log("Order ID:", orderId);
    console.log("Has Data:", !!sabpaisaDataStr);

    if (!orderId || !sabpaisaDataStr) {
      console.error("❌ Missing orderId or formData");
      toast.error("Invalid payment request");
      setTimeout(() => navigate("/checkout"), 1000);
      return;
    }

    try {
      const formData = JSON.parse(sabpaisaDataStr);

      console.log("✅ Form data parsed");
      console.log("Payment Data:", {
        clientCode: formData.clientCode,
        clientTxnId: formData.clientTxnId,
        amount: formData.amount,
      });

      // ✅ Validate all required fields
      const requiredFields = [
        "clientCode",
        "transUserName",
        "transUserPassword",
        "authKey",
        "authIV",
        "callbackUrl",
        "clientTxnId",
        "payerName",
        "payerEmail",
        "payerMobile",
        "amount",
        "channelId",
      ];

      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        console.error("❌ Missing required fields:", missingFields);
        throw new Error(`Missing fields: ${missingFields.join(", ")}`);
      }

      console.log("✅ All required fields present");

      // ✅ Submit to SabPaisa using submitPaymentForm
      const env = process.env.REACT_APP_SABPAISA_ENV || "stag";
      console.log("🚀 Submitting payment form to SabPaisa (env: " + env + ")");

      submitPaymentForm(formData, env);
    } catch (error) {
      console.error("❌ Error:", error.message);
      toast.error(error.message || "Failed to process payment");
      navigate("/checkout");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Processing Payment
        </h1>
        <p className="text-gray-600">🔒 Redirecting to SabPaisa Gateway...</p>
        <p className="text-sm text-gray-500 mt-4">
          If you are not redirected automatically, please wait a moment.
        </p>
      </div>
    </div>
  );
};

export default SabPaisaPaymentForm;
