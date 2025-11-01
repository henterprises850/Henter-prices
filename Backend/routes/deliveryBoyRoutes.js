// routes/deliveryBoyRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAssignedOrders,
  updateOrderStatusAsDeliveryBoy,
  getDeliveryBoyStats,
  getDeliveryBoyProfile,
} = require("../controllers/deliveryBoyController");

// Delivery boy routes (protected)
router.get("/orders", protect, getAssignedOrders); // Get assigned orders
router.put("/orders/:id/status", protect, updateOrderStatusAsDeliveryBoy); // Update status
router.get("/stats", protect, getDeliveryBoyStats); // Get delivery stats
router.get("/profile", protect, getDeliveryBoyProfile); // Get profile
// ✅ Update payment status (for delivery boys confirming COD payments)
router.put("/orders/:orderId/payment-status", protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paymentNotes } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    // Only allow certain status transitions
    const allowedTransitions = ["completed"];
    if (!allowedTransitions.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status transition",
      });
    }

    // Find order assigned to this delivery boy
    const order = await Order.findOne({
      _id: orderId,
      assignedDeliveryBoy: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you",
      });
    }

    // Only allow payment status update for pending COD payments
    if (order.paymentMethod !== "COD" || order.paymentStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only update pending COD payment status",
      });
    }

    // Update payment status
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: paymentStatus,
      paidAt: new Date(),
      deliveryNotes: paymentNotes || "",
      $push: {
        statusHistory: {
          status: `Payment ${paymentStatus}`,
          updatedBy: req.user.id,
          updatedByName: req.user.name,
          updatedByRole: "deliveryBoy",
          timestamp: new Date(),
          reason: `Payment received by ${req.user.name}`,
        },
      },
    });

    console.log(
      `✅ Payment confirmed for order ${orderId} by delivery boy ${req.user.id}`
    );

    res.json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update payment status",
    });
  }
});

module.exports = router;
