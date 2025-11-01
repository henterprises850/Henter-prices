const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  getUserOrders,
  getAllOrdersAdmin,
  getOrderStats,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders,
  assignOrderToDeliveryBoy,
  getActiveDeliveryBoys,
  getDeliveryBoyAssignedOrders,
  updateRefundStatus,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// ============================================
// USER ROUTES (PROTECTED)
// ============================================

// Create new order
router.post("/", protect, createOrder);

// Get current user's orders
router.get("/my-orders", protect, getUserOrders);

// Get single order by ID
router.get("/:id", protect, getOrderById);

// ============================================
// ADMIN ROUTES (PROTECTED + ADMIN)
// ============================================

// Get all orders (basic pagination)
router.get("/", protect, admin, getOrders);

// Get all orders with advanced filters
router.get("/admin/all", protect, admin, getAllOrdersAdmin);

// Get order statistics
router.get("/admin/stats", protect, admin, getOrderStats);

// Update order status
router.put("/:id/status", protect, admin, updateOrderStatus);

// Delete single order (soft delete)
router.delete("/:id", protect, admin, deleteOrder);

// Delete all orders (with password confirmation)
router.delete("/admin/delete-all", protect, admin, deleteAllOrders);

// ============================================
// DELIVERY BOY ASSIGNMENT ROUTES
// ============================================

// Assign order to delivery boy
router.post("/admin/assign", protect, admin, assignOrderToDeliveryBoy);

// Get active delivery boys (for dropdown)
router.get("/admin/delivery-boys", protect, admin, getActiveDeliveryBoys);

// Get orders assigned to specific delivery boy
router.get(
  "/admin/delivery-boy/:deliveryBoyId",
  protect,
  admin,
  getDeliveryBoyAssignedOrders
);

router.put("/:orderId/refund", protect, admin, updateRefundStatus);

module.exports = router;
