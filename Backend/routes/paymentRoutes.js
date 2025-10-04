const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

// Cashfree API Configuration
const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENVIRONMENT === "PRODUCTION"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

// Generate unique order ID
const generateOrderId = () => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to make Cashfree API calls
const makeCashfreeApiCall = async (endpoint, method = "GET", data = null) => {
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "x-api-version": "2023-08-01",
    "x-client-id": process.env.CASHFREE_CLIENT_ID,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
  };

  const config = {
    method,
    url: `${CASHFREE_BASE_URL}${endpoint}`,
    headers,
  };

  if (data && (method === "POST" || method === "PUT")) {
    config.data = data;
  }

  return await axios(config);
};

// Create Cashfree Order
router.post("/cashfree/create-order", protect, async (req, res) => {
  try {
    const { orderData, amount, customerDetails } = req.body;

    // Validate required data
    if (!orderData || !amount || !customerDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment data",
      });
    }

    // Validate customer phone number (must be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = customerDetails.phone.replace(/[^0-9]/g, "").slice(-10);

    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number",
      });
    }

    // Create order in database first
    const newOrder = new Order({
      user: req.user.id,
      ...orderData,
      paymentStatus: "pending",
      orderStatus: "Order Placed",
      customerDetails,
      createdAt: new Date(),
    });

    const savedOrder = await newOrder.save();
    const orderId = generateOrderId();

    // Prepare Cashfree order request
    const cashfreeOrderRequest = {
      order_amount: parseFloat(amount),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: req.user.id.toString(),
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: cleanPhone,
      },
      order_note: `Order from ${customerDetails.name}`,
    };

    // Create order with Cashfree using direct API call
    const cashfreeResponse = await makeCashfreeApiCall(
      "/pg/orders",
      "POST",
      cashfreeOrderRequest
    );

    if (
      cashfreeResponse.status === 200 &&
      cashfreeResponse.data?.payment_session_id
    ) {
      const { payment_session_id, order_id } = cashfreeResponse.data;

      // Update order with Cashfree details
      await Order.findByIdAndUpdate(savedOrder._id, {
        cashfreeOrderId: order_id || orderId,
        paymentSessionId: payment_session_id,
      });

      res.json({
        success: true,
        message: "Order created successfully",
        paymentSessionId: payment_session_id,
        orderId: savedOrder._id,
        cashfreeOrderId: order_id || orderId,
      });
    } else {
      // Delete the created order if Cashfree order creation fails
      await Order.findByIdAndDelete(savedOrder._id);

      console.error("Cashfree order creation failed:", cashfreeResponse.data);
      res.status(400).json({
        success: false,
        message: "Failed to create payment order",
        error:
          cashfreeResponse.data?.message ||
          "Invalid response from payment gateway",
      });
    }
  } catch (error) {
    console.error(
      "Cashfree order creation error:",
      error.response?.data || error.message
    );

    // Extract meaningful error message
    let errorMessage = "Failed to create payment order";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.type) {
      errorMessage = `${error.response.data.type}: ${error.response.data.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Log detailed error for debugging
    console.error("Detailed error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

// Verify Payment
router.get("/cashfree/verify/:orderId", protect, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find order belonging to the authenticated user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
    }

    if (!order.cashfreeOrderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid order - no payment reference found",
      });
    }

    // Fetch payment details from Cashfree using direct API call
    const paymentsResponse = await makeCashfreeApiCall(
      `/pg/orders/${order.cashfreeOrderId}/payments`
    );

    if (paymentsResponse.status === 200 && paymentsResponse.data) {
      const payments = paymentsResponse.data;
      let paymentStatus = "FAILED";
      let paymentDetails = null;

      // Check for successful payment
      const successfulPayment = payments.find(
        (payment) => payment.payment_status === "SUCCESS"
      );

      console.log("Verifying payment for order:", orderId, paymentsResponse);

      if (successfulPayment) {
        paymentStatus = "SUCCESS";
        paymentDetails = successfulPayment;

        // Update order in database
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "completed",
          orderStatus: "confirmed",
          paidAt: new Date(),
          cashfreePaymentId: successfulPayment.cf_payment_id,
          paymentMethod: successfulPayment.payment_method,
        });
      } else {
        // Check for pending payments
        const pendingPayment = payments.find(
          (payment) => payment.payment_status === "PENDING"
        );

        if (pendingPayment) {
          paymentStatus = "PENDING";
          paymentDetails = pendingPayment;
        } else {
          // Mark as failed
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "failed",
            orderStatus: "cancelled",
            failureReason: "Payment failed or cancelled",
          });
        }
      }

      res.json({
        success: true,
        paymentStatus,
        paymentDetails,
        order: await Order.findById(orderId),
      });
    } else {
      console.error("Failed to fetch payment details:", paymentsResponse.data);
      res.status(400).json({
        success: false,
        message: "Failed to verify payment status",
      });
    }
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Payment verification failed",
    });
  }
});

// Handle payment callback
router.post("/cashfree/callback", protect, async (req, res) => {
  try {
    const { orderId, status, error } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let updateData = {};

    if (status === "SUCCESS") {
      updateData = {
        paymentStatus: "completed",
        orderStatus: "confirmed",
        paidAt: new Date(),
      };
    } else if (status === "FAILED") {
      updateData = {
        paymentStatus: "failed",
        orderStatus: "cancelled",
        failureReason: error || "Payment failed",
      };
    }

    await Order.findByIdAndUpdate(orderId, updateData);

    res.json({
      success: true,
      message: "Payment status updated",
    });
  } catch (error) {
    console.error("Payment callback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
});

// Webhook handler for real-time updates
router.post("/cashfree/webhook", async (req, res) => {
  try {
    // Verify webhook signature
    const receivedSignature = req.headers["x-webhook-signature"];
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;

    if (webhookSecret && receivedSignature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("base64");

      if (receivedSignature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return res.status(401).json({
          success: false,
          message: "Invalid signature",
        });
      }
    }

    const { type, data } = req.body;
    console.log("Webhook received:", { type, data });

    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { order } = data;
      const { order_id, payment_amount, cf_payment_id } = order;

      // Find order by cashfreeOrderId
      const dbOrder = await Order.findOne({ cashfreeOrderId: order_id });

      if (dbOrder) {
        await Order.findByIdAndUpdate(dbOrder._id, {
          paymentStatus: "completed",
          orderStatus: "confirmed",
          paidAt: new Date(),
          cashfreePaymentId: cf_payment_id,
        });

        console.log(`Webhook: Payment successful for order ${order_id}`);
      }
    } else if (type === "PAYMENT_FAILED_WEBHOOK") {
      const { order } = data;
      const { order_id, payment_message } = order;

      const dbOrder = await Order.findOne({ cashfreeOrderId: order_id });

      if (dbOrder) {
        await Order.findByIdAndUpdate(dbOrder._id, {
          paymentStatus: "failed",
          orderStatus: "cancelled",
          failureReason: payment_message || "Payment failed",
        });

        console.log(`Webhook: Payment failed for order ${order_id}`);
      }
    }

    res.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
});

// Get payment status
router.get("/cashfree/status/:orderId", protect, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        amount: order.totalPrice,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        cashfreeOrderId: order.cashfreeOrderId,
        cashfreePaymentId: order.cashfreePaymentId,
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order status",
    });
  }
});

// Test route - Simple order creation
router.post("/cashfree/test-simple", async (req, res) => {
  try {
    const testOrder = {
      order_amount: 100,
      order_currency: "INR",
      order_id: `test_${Date.now()}`,
      customer_details: {
        customer_id: "test_123",
        customer_name: "Test User",
        customer_email: "test@test.com",
        customer_phone: "9999999999",
      },
    };

    console.log("Creating test order:", testOrder);

    const response = await makeCashfreeApiCall("/pg/orders", "POST", testOrder);

    console.log("Test order response:", response.data);

    res.json({
      success: true,
      message: "Test order successful",
      response: response.data,
    });
  } catch (error) {
    console.error("Test order error:", error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// Test credentials
router.get("/cashfree/test-credentials", (req, res) => {
  res.json({
    success: true,
    environment: process.env.CASHFREE_ENVIRONMENT,
    clientId: process.env.CASHFREE_CLIENT_ID ? "Present" : "Missing",
    clientSecret: process.env.CASHFREE_CLIENT_SECRET ? "Present" : "Missing",
    baseUrl: CASHFREE_BASE_URL,
  });
});

module.exports = router;
