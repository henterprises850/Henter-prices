const express = require("express");
const {
  getAllDeliveryBoys,
  getDeliveryBoyById,
  verifyDeliveryBoyDocuments,
  updateDeliveryBoyStatus,
  updateDeliveryBoyDetails,
  updateDeliveryBoyRating,
  getDeliveryBoyStats,
  deleteDeliveryBoy,
} = require("../controllers/deliveryBoyVerificationController");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// ============================================
// ADMIN ROUTES (PROTECTED + ADMIN)
// ============================================

// Get all delivery boys with filters
router.get("/", protect, admin, getAllDeliveryBoys);

// Get delivery boy statistics
router.get("/stats", protect, admin, getDeliveryBoyStats);

// Get single delivery boy details
router.get("/:deliveryBoyId", protect, admin, getDeliveryBoyById);

// Verify delivery boy documents
router.put(
  "/:deliveryBoyId/verify",
  protect,
  admin,
  verifyDeliveryBoyDocuments
);

// Update delivery boy status (active/inactive/suspended)
router.put("/:deliveryBoyId/status", protect, admin, updateDeliveryBoyStatus);

// Update delivery boy details (vehicle, license, area)
router.put("/:deliveryBoyId/details", protect, admin, updateDeliveryBoyDetails);

// Update delivery boy rating
router.put("/:deliveryBoyId/rating", protect, admin, updateDeliveryBoyRating);

// Delete delivery boy
router.delete("/:deliveryBoyId", protect, admin, deleteDeliveryBoy);

module.exports = router;
