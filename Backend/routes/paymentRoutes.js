const express = require("express");
const {
  createCashfreeOrder,
  verifyCashfreePayment,
  getCashfreePaymentStatus,
  handleCashfreeWebhook,
  createCODOrder,
  // New Sabpaisa
  createSabpaisaOrder,
  verifySabpaisaPayment,
  getSabpaisaPaymentStatus,
  handleSabpaisaWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ✅ Cashfree Payment Endpoints
router.post("/cashfree/create-order", protect, createCashfreeOrder);
router.get("/cashfree/verify/:orderId", protect, verifyCashfreePayment);
router.get("/cashfree/status/:orderId", protect, getCashfreePaymentStatus);
router.post("/cashfree/webhook", handleCashfreeWebhook); // No auth needed

// ✅ COD Order (No payment gateway needed)
router.post("/cod/create-order", protect, createCODOrder);

// ✅ NEW: Sabpaisa Routes
router.post("/sabpaisa/create-order", protect, createSabpaisaOrder);
router.get("/sabpaisa/verify/:orderId", protect, verifySabpaisaPayment);
router.get("/sabpaisa/status/:orderId", protect, getSabpaisaPaymentStatus);
router.post("/sabpaisa/webhook", handleSabpaisaWebhook); // No auth

module.exports = router;
