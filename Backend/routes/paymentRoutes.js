const express = require("express");
const {
  createCashfreeOrder,
  verifyCashfreePayment,
  getCashfreePaymentStatus,
  handleCashfreeWebhook,
  createCODOrder,
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

module.exports = router;
