const crypto = require("crypto");
const Order = require("../models/Order");

// Mock Razorpay API Configuration
const MOCK_API_BASE_URL =
  "https://app.beeceptor.com/mock-server/razorpay-mock-api";
const MOCK_KEY_ID = "rzp_test_mock_key";
const MOCK_KEY_SECRET = "mock_secret_key_for_testing";

// Create Mock Razorpay Order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    // Create mock order data
    const mockOrderData = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        order_type: "ecommerce",
        customer_id: req.user.id,
      },
    };

    // Simulate API call to mock Razorpay
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      entity: "order",
      amount: mockOrderData.amount,
      amount_paid: 0,
      amount_due: mockOrderData.amount,
      currency: mockOrderData.currency,
      receipt: mockOrderData.receipt,
      status: "created",
      attempts: 0,
      notes: mockOrderData.notes,
      created_at: Math.floor(Date.now() / 1000),
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    res.json({
      success: true,
      order: mockOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create mock Razorpay order",
      error: error.message,
    });
  }
};

// Verify Mock Razorpay Payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Create mock signature for validation
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", MOCK_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    // For mock API, we'll simulate successful verification
    const isSignatureValid = true; // Always true for mock

    if (isSignatureValid) {
      // Update order status
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: razorpay_payment_id,
          status: "completed",
          updateTime: new Date().toISOString(),
          mockPayment: true,
        };
        await order.save();
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      res.json({
        success: true,
        message: "Mock payment verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Mock PhonePe Integration
const createPhonePeOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Create mock PhonePe response
    const mockPhonePeResponse = {
      success: true,
      code: "SUCCESS",
      message: "Mock PhonePe order created successfully",
      data: {
        merchantId: "MOCK_MERCHANT",
        merchantTransactionId: `MT_mock_${Date.now()}`,
        instrumentResponse: {
          type: "PAY_PAGE",
          redirectInfo: {
            url: `${process.env.FRONTEND_URL}/payment/mock-phonepe?orderId=${orderId}&amount=${amount}`,
            method: "GET",
          },
        },
      },
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    res.json({
      success: true,
      data: mockPhonePeResponse,
      url: mockPhonePeResponse.data.instrumentResponse.redirectInfo.url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mock PhonePe order creation failed",
      error: error.message,
    });
  }
};

// Get Mock Payment Status
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Mock payment status
    const mockPaymentStatus = {
      id: paymentId,
      entity: "payment",
      amount: 100000, // Mock amount
      currency: "INR",
      status: "captured",
      method: "card",
      amount_refunded: 0,
      refund_status: null,
      captured: true,
      description: "Mock payment for testing",
      card_id: "card_mock_id",
      order_id: `order_mock_${Date.now()}`,
      created_at: Math.floor(Date.now() / 1000),
      notes: {
        mock_payment: true,
      },
    };

    await new Promise((resolve) => setTimeout(resolve, 200));

    res.json({
      success: true,
      payment: mockPaymentStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get payment status",
      error: error.message,
    });
  }
};

const ProcessGooglePay = async (req, res) => {
  try {
    const { paymentData, amount } = req.body;

    // Extract the payment token from Google Pay data
    const paymentToken = paymentData.paymentMethodData.tokenizationData.token;

    // Parse the token (this varies by payment processor)
    const token = JSON.parse(paymentToken);

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      payment_method_data: {
        type: "card",
        card: {
          token: token.id, // Use the token from Google Pay
        },
      },
      confirmation_method: "manual",
      confirm: true,
      return_url: "https://your-website.com/return",
    });

    if (paymentIntent.status === "succeeded") {
      // Payment successful
      res.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        message: "Payment processed successfully",
      });
    } else {
      // Payment requires additional action
      res.json({
        success: false,
        error: "Payment requires additional authentication",
        paymentIntent: paymentIntent,
      });
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const CreatePaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPhonePeOrder,
  getPaymentStatus,
  ProcessGooglePay,
  CreatePaymentIntent
};
