const mongoose = require("mongoose");
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");
const User = require("../models/User");

// ============================================
// CASHFREE CONFIGURATION
// ============================================
const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENVIRONMENT === "PRODUCTION"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

// ✅ Validate configuration
if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
  console.error("❌ Cashfree credentials not configured!");
}

// ============================================
// HELPER: Make Cashfree API Calls
// ============================================
const makeCashfreeApiCall = async (
  endpoint,
  method = "GET",
  data = null,
  timeout = 10000
) => {
  try {
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-version": "2023-08-01",
      "x-client-id": CASHFREE_CLIENT_ID,
      "x-client-secret": CASHFREE_CLIENT_SECRET,
    };

    const config = {
      method,
      url: `${CASHFREE_BASE_URL}${endpoint}`,
      headers,
      timeout,
    };

    if (data && (method === "POST" || method === "PUT")) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    console.error("Cashfree API Error:", {
      endpoint,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// ============================================
// HELPER: Generate Unique Order ID
// ============================================
const generateOrderId = () => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// HELPER: Validate Phone Number
// ============================================
const validateAndCleanPhone = (phone) => {
  if (!phone) throw new Error("Phone number is required");

  let cleaned = phone.replace(/[^0-9+]/g, "");

  // Remove country code if present
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.length !== 10) {
    throw new Error("Phone must be exactly 10 digits");
  }

  if (!/^[0-9]{10}$/.test(cleaned)) {
    throw new Error("Phone contains invalid characters");
  }

  return cleaned;
};

// ============================================
// HELPER: Validate Amount
// ============================================
const validateAmount = (amount) => {
  if (!amount || typeof amount !== "number") {
    throw new Error("Invalid amount - must be a number");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  if (amount > 9999999) {
    throw new Error("Amount exceeds maximum limit (₹99,99,999)");
  }

  const decimalPlaces = amount.toString().split(".")[1]?.length || 0;
  if (decimalPlaces > 2) {
    throw new Error("Amount can have maximum 2 decimal places");
  }

  return true;
};

// ============================================
// HELPER: Validate Shipping Address
// ============================================
const validateShippingAddress = (address) => {
  const required = ["fullName", "address", "city", "state", "pincode", "phone"];

  const missing = required.filter(
    (field) => !address[field]?.toString().trim()
  );

  if (missing.length > 0) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  // Validate pincode (6 digits)
  if (!/^\d{6}$/.test(address.pincode.toString())) {
    throw new Error("Pincode must be 6 digits");
  }

  return true;
};

// ============================================
// 1. CREATE CASHFREE ORDER
// ============================================
const createCashfreeOrder = async (req, res) => {
  let orderId = null;

  try {
    // ✅ Verify authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ✅ Validate input
    const { orderData, amount, customerDetails } = req.body;

    if (!orderData || !amount || !customerDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment data",
      });
    }

    // ✅ Validate amount
    validateAmount(amount);

    // ✅ Validate phone
    const cleanPhone = validateAndCleanPhone(customerDetails.phone);

    // ✅ Validate shipping address
    validateShippingAddress(orderData.shippingAddress);

    // ✅ Create order in database with PENDING status
    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(req.user.id),
      orderItems: orderData.orderItems.map((item) => ({
        product: item.product || null,
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        image: item.image,
      })),
      shippingAddress: orderData.shippingAddress,
      paymentMethodName: "CASHFREE",

      // ✅ Status at creation time
      orderStatus: "pending", // Waiting for payment
      paymentStatus: "pending", // Awaiting payment

      // Price details
      totalPrice: amount,
      shippingPrice: orderData.shippingPrice || 0,
      taxPrice: orderData.taxPrice || 0,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedOrder = await newOrder.save();

    console.log("✅ Order created in DB:", savedOrder._id);

    // ✅ Generate Cashfree order ID
    const cashfreeOrderId = generateOrderId();

    // ✅ Prepare Cashfree order request
    const cashfreeOrderRequest = {
      order_amount: parseFloat(amount),
      order_currency: "INR",
      order_id: cashfreeOrderId,
      customer_details: {
        customer_id: req.user.id.toString(),
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: cleanPhone,
      },
      order_note: `Order from ${customerDetails.name} - Order#${savedOrder._id
        .toString()
        .slice(-6)}`,
      order_tags: {
        ecommerce: "true",
        user_id: req.user.id.toString(),
      },
    };

    console.log("📤 Creating Cashfree order:", cashfreeOrderId);

    // ✅ Create order with Cashfree API
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

      // ✅ Update order with Cashfree details
      await Order.findByIdAndUpdate(savedOrder._id, {
        cashfreeOrderId: order_id || cashfreeOrderId,
        paymentSessionId: payment_session_id,
      });

      console.log("✅ Order created successfully:", {
        orderId: savedOrder._id,
        cashfreeOrderId: order_id || cashfreeOrderId,
      });

      res.json({
        success: true,
        message: "Order created successfully",
        orderId: savedOrder._id,
        paymentSessionId: payment_session_id,
        cashfreeOrderId: order_id || cashfreeOrderId,
      });
    } else {
      // ✅ Delete order if Cashfree fails
      await Order.findByIdAndDelete(savedOrder._id);

      console.error(
        "❌ Cashfree order creation failed:",
        cashfreeResponse.data
      );

      res.status(400).json({
        success: false,
        message:
          cashfreeResponse.data?.message || "Failed to create payment order",
      });
    }
  } catch (error) {
    console.error("❌ Create order error:", error.message);

    // Clean up: Delete order if it was created but something failed
    if (orderId) {
      await Order.findByIdAndDelete(orderId).catch((e) =>
        console.error("Cleanup error:", e)
      );
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// ============================================
// 2. VERIFY CASHFREE PAYMENT (UPDATED)
// ============================================
const verifyCashfreePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    // ✅ Verify authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ✅ Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ✅ Find order
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
        message: "Invalid order - no payment reference",
      });
    }

    console.log("🔍 Verifying payment for order:", orderId);

    // ✅ Fetch payments from Cashfree
    const paymentsResponse = await makeCashfreeApiCall(
      `/pg/orders/${order.cashfreeOrderId}/payments`
    );

    if (paymentsResponse.status === 200 && paymentsResponse.data) {
      const payments = paymentsResponse.data;

      console.log("💳 Total payments found:", payments.length);

      // ✅ Find the LATEST successful payment
      const successfulPayments = payments.filter(
        (payment) => payment.payment_status === "SUCCESS"
      );

      if (successfulPayments.length > 0) {
        // Get the most recent successful payment
        const successfulPayment = successfulPayments.sort(
          (a, b) =>
            new Date(b.payment_time).getTime() -
            new Date(a.payment_time).getTime()
        )[0];

        console.log("✅ PAYMENT SUCCESS!");

        // ✅ UPDATE ORDER WITH SUCCESSFUL PAYMENT
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            // ✅ Payment Status
            paymentStatus: "completed",
            paidAt: new Date(),
            cashfreePaymentId: successfulPayment.cf_payment_id,
            paymentMethodName: successfulPayment.payment_method,
            paymentAmount: successfulPayment.amount,

            // ✅ Order Status
            orderStatus: "Order Placed",

            // ✅ Status History
            $push: {
              statusHistory: {
                status: "Order Placed",
                updatedBy: null,
                updatedByName: "System",
                updatedByRole: "system",
                timestamp: new Date(),
                reason: "Payment successful via Cashfree",
              },
            },

            updatedAt: new Date(),
          },
          { new: true }
        );

        console.log("✅ Order updated successfully");

        // ✅ Response with confirmed data
        res.json({
          success: true,
          paymentStatus: "SUCCESS",
          orderStatus: "Order Placed",
          order: updatedOrder,
          message: "Payment verified successfully",
        });
      } else {
        // ✅ Check for pending payments
        const pendingPayment = payments.find(
          (payment) => payment.payment_status === "PENDING"
        );

        if (pendingPayment) {
          console.log("⏳ Payment still pending...");

          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "processing",
            orderStatus: "pending",
            updatedAt: new Date(),
          });

          res.json({
            success: true,
            paymentStatus: "PENDING",
            orderStatus: "pending",
            message: "Payment is being processed. Please wait.",
          });
        } else {
          // ✅ Payment failed
          console.log("❌ PAYMENT FAILED!");

          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "failed",
            orderStatus: "cancelled",
            failureReason: "Payment failed or was cancelled",
            updatedAt: new Date(),
          });

          res.json({
            success: true,
            paymentStatus: "FAILED",
            orderStatus: "cancelled",
            message: "Payment failed. Please try again.",
          });
        }
      }
    } else {
      throw new Error("Invalid response from Cashfree API");
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

// ============================================
// 3. GET PAYMENT STATUS
// ============================================
const getCashfreePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // ✅ Verify authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ✅ Find order
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
    console.error("❌ Status check error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order status",
    });
  }
};

// ============================================
// 4. WEBHOOK HANDLER (Real-time Updates)
// ============================================
const handleCashfreeWebhook = async (req, res) => {
  try {
    console.log("🔔 Webhook received from Cashfree");

    // ✅ Verify webhook signature
    const receivedSignature = req.headers["x-webhook-signature"];

    if (!CASHFREE_WEBHOOK_SECRET) {
      console.error("❌ Webhook secret not configured!");
      return res.status(500).json({
        success: false,
        message: "Webhook configuration error",
      });
    }

    if (!receivedSignature) {
      console.error("❌ No signature in webhook");
      return res.status(401).json({
        success: false,
        message: "Missing signature",
      });
    }

    // ✅ Verify signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", CASHFREE_WEBHOOK_SECRET)
      .update(body)
      .digest("base64");

    if (receivedSignature.trim() !== expectedSignature.trim()) {
      console.error("❌ Invalid webhook signature");
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    console.log("✅ Webhook signature verified");

    const { type, data } = req.body;

    // ✅ PAYMENT SUCCESS WEBHOOK
    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { order } = data;
      const { order_id, cf_payment_id } = order;

      console.log("✅ Payment success webhook for order:", order_id);

      // Find order by cashfreeOrderId
      const dbOrder = await Order.findOne({ cashfreeOrderId: order_id });

      if (dbOrder) {
        await Order.findByIdAndUpdate(dbOrder._id, {
          paymentStatus: "completed",
          orderStatus: "Order Placed",
          paidAt: new Date(),
          cashfreePaymentId: cf_payment_id,
          $push: {
            statusHistory: {
              status: "Order Placed",
              updatedBy: null,
              updatedByName: "System (Webhook)",
              updatedByRole: "system",
              timestamp: new Date(),
              reason: "Payment confirmed via webhook",
            },
          },
        });

        console.log("✅ Order updated - Payment confirmed");
      }
    }
    // ✅ PAYMENT FAILED WEBHOOK
    else if (type === "PAYMENT_FAILED_WEBHOOK") {
      const { order } = data;
      const { order_id, payment_message } = order;

      console.log("❌ Payment failed webhook for order:", order_id);

      const dbOrder = await Order.findOne({ cashfreeOrderId: order_id });

      if (dbOrder) {
        await Order.findByIdAndUpdate(dbOrder._id, {
          paymentStatus: "failed",
          orderStatus: "cancelled",
          failureReason: payment_message || "Payment failed",
          $push: {
            statusHistory: {
              status: "cancelled",
              updatedBy: null,
              updatedByName: "System (Webhook)",
              updatedByRole: "system",
              timestamp: new Date(),
              reason: payment_message || "Payment failed",
            },
          },
        });

        console.log("✅ Order updated - Payment failed");
      }
    }

    // ✅ Always respond with success to prevent Cashfree retries
    res.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);

    // ✅ Still respond with success to prevent webhook retries
    res.json({
      success: true,
      message: "Webhook processed",
    });
  }
};

// ============================================
// 5. CREATE COD ORDER (Cash on Delivery)
// ============================================
const createCODOrder = async (req, res) => {
  try {
    // ✅ Verify authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { orderData, amount } = req.body;

    // ✅ Validate input
    if (!orderData || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required order data",
      });
    }

    // ✅ Validate amount
    validateAmount(amount);

    // ✅ Validate shipping address
    validateShippingAddress(orderData.shippingAddress);

    // ✅ Create order - COD (payment marked as pending until delivered)
    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(req.user.id),
      orderItems: orderData.orderItems.map((item) => ({
        product: item.product || null,
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        image: item.image,
      })),
      shippingAddress: orderData.shippingAddress,
      paymentMethodName: "COD", // Cash on Delivery

      // ✅ Status for COD
      orderStatus: "Order Placed", // Ready for processing immediately
      paymentStatus: "pending", // Will be marked as "completed" when delivered and paid

      totalPrice: amount,
      shippingPrice: orderData.shippingPrice || 0,
      taxPrice: orderData.taxPrice || 0,

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedOrder = await newOrder.save();

    console.log("✅ COD Order created:", savedOrder._id);

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: savedOrder._id,
      paymentMethod: "COD",
      orderStatus: "Order Placed",
    });
  } catch (error) {
    console.error("❌ COD order error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

module.exports = {
  createCashfreeOrder,
  verifyCashfreePayment,
  getCashfreePaymentStatus,
  handleCashfreeWebhook,
  createCODOrder,
};
