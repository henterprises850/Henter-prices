const express = require("express");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPhonePeOrder,
  getPaymentStatus, // <- MAKE SURE THIS IS IMPORTED
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Mock Razorpay routes
router.post("/razorpay/create-order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.get("/razorpay/payment/:paymentId", protect, getPaymentStatus); // <- THIS SHOULD NOW WORK

// Mock PhonePe routes
router.post("/phonepe/create-order", protect, createPhonePeOrder);

module.exports = router;
