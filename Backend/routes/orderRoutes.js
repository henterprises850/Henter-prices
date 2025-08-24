const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// User routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

// Admin routes
router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
