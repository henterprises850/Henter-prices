const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");

// ============================================
// GET ALL DELIVERY BOYS
// ============================================
const getAllDeliveryBoys = async (req, res) => {
  try {
    const { status = "", search = "", page = 1, limit = 10 } = req.query;

    let filter = { isDeliveryBoy: true };

    // Filter by status
    if (status) {
      filter["deliveryDetails.status"] = status;
    }

    // Search by name or phone
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [{ name: searchRegex }, { phone: searchRegex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const deliveryBoys = await User.find(filter)
      .select("-password")
      .sort({ "deliveryDetails.joinDate": -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      deliveryBoys,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDeliveryBoys: total,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery boys:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// GET DELIVERY BOY BY ID
// ============================================
const getDeliveryBoyById = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    const deliveryBoy = await User.findById(deliveryBoyId).select("-password");

    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    // Get delivery statistics
    const totalOrders = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
    });

    const deliveredOrders = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
      orderStatus: "delivered",
    });

    const pendingOrders = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
      orderStatus: { $in: ["processing", "shipped"] },
    });

    res.json({
      success: true,
      deliveryBoy,
      stats: {
        totalOrders,
        deliveredOrders,
        pendingOrders,
        successRate:
          totalOrders > 0
            ? Math.round((deliveredOrders / totalOrders) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery boy:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// VERIFY DELIVERY BOY DOCUMENTS
// ============================================
const verifyDeliveryBoyDocuments = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const { documentsVerified, phoneVerified, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    const deliveryBoy = await User.findById(deliveryBoyId);

    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    // Update verification status
    if (documentsVerified !== undefined) {
      deliveryBoy.deliveryDetails.documentsVerified = documentsVerified;
    }

    if (phoneVerified !== undefined) {
      deliveryBoy.deliveryDetails.phoneVerified = phoneVerified;
    }

    // Add verification history if both verified
    if (
      deliveryBoy.deliveryDetails.documentsVerified &&
      deliveryBoy.deliveryDetails.phoneVerified
    ) {
      // Both verified, update to active
      deliveryBoy.deliveryDetails.status = "active";
    }

    await deliveryBoy.save();

    res.json({
      success: true,
      message: "Verification status updated",
      deliveryBoy,
    });
  } catch (error) {
    console.error("Error verifying delivery boy:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE DELIVERY BOY STATUS
// ============================================
const updateDeliveryBoyStatus = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const { status, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    const validStatuses = ["active", "inactive", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        validStatuses,
      });
    }

    const deliveryBoy = await User.findById(deliveryBoyId);

    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    // Check if both documents and phone are verified before activating
    if (
      status === "active" &&
      (!deliveryBoy.deliveryDetails.documentsVerified ||
        !deliveryBoy.deliveryDetails.phoneVerified)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery boy must have both documents and phone verified before activation",
      });
    }

    const oldStatus = deliveryBoy.deliveryDetails.status;
    deliveryBoy.deliveryDetails.status = status;

    // If activating, set activation date
    if (status === "active" && oldStatus !== "active") {
      deliveryBoy.deliveryDetails.joinDate = new Date();
    }

    await deliveryBoy.save();

    res.json({
      success: true,
      message: `Delivery boy status updated from ${oldStatus} to ${status}`,
      deliveryBoy,
    });
  } catch (error) {
    console.error("Error updating delivery boy status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE DELIVERY BOY DETAILS
// ============================================
const updateDeliveryBoyDetails = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const { vehicleNumber, licenseNumber, assignedArea } = req.body;

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    const deliveryBoy = await User.findById(deliveryBoyId);

    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    // Update delivery details
    if (vehicleNumber) {
      deliveryBoy.deliveryDetails.vehicleNumber = vehicleNumber;
    }

    if (licenseNumber) {
      deliveryBoy.deliveryDetails.licenseNumber = licenseNumber;
    }

    if (assignedArea) {
      deliveryBoy.deliveryDetails.assignedArea = assignedArea;
    }

    await deliveryBoy.save();

    res.json({
      success: true,
      message: "Delivery boy details updated successfully",
      deliveryBoy,
    });
  } catch (error) {
    console.error("Error updating delivery boy details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE DELIVERY BOY RATING
// ============================================
const updateDeliveryBoyRating = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const { rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    const deliveryBoy = await User.findById(deliveryBoyId);

    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    deliveryBoy.deliveryDetails.rating = rating;
    await deliveryBoy.save();

    res.json({
      success: true,
      message: "Rating updated successfully",
      deliveryBoy,
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// GET DELIVERY BOY STATISTICS
// ============================================
const getDeliveryBoyStats = async (req, res) => {
  try {
    const totalDeliveryBoys = await User.countDocuments({
      isDeliveryBoy: true,
    });

    const activeDeliveryBoys = await User.countDocuments({
      isDeliveryBoy: true,
      "deliveryDetails.status": "active",
    });

    const inactiveDeliveryBoys = await User.countDocuments({
      isDeliveryBoy: true,
      "deliveryDetails.status": "inactive",
    });

    const suspendedDeliveryBoys = await User.countDocuments({
      isDeliveryBoy: true,
      "deliveryDetails.status": "suspended",
    });

    const verifiedDeliveryBoys = await User.countDocuments({
      isDeliveryBoy: true,
      "deliveryDetails.documentsVerified": true,
      "deliveryDetails.phoneVerified": true,
    });

    const pendingVerificationDeliveryBoys =
      totalDeliveryBoys - verifiedDeliveryBoys;

    res.json({
      success: true,
      stats: {
        totalDeliveryBoys,
        activeDeliveryBoys,
        inactiveDeliveryBoys,
        suspendedDeliveryBoys,
        verifiedDeliveryBoys,
        pendingVerificationDeliveryBoys,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery boy stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// DELETE DELIVERY BOY
// ============================================
const deleteDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    // Check if delivery boy has assigned orders
    const assignedOrders = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
    });

    if (assignedOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete delivery boy with ${assignedOrders} assigned orders`,
      });
    }

    const result = await User.findByIdAndUpdate(
      deliveryBoyId,
      {
        isDeliveryBoy: false,
        deliveryDetails: {},
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    res.json({
      success: true,
      message: "Delivery boy deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting delivery boy:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDeliveryBoys,
  getDeliveryBoyById,
  verifyDeliveryBoyDocuments,
  updateDeliveryBoyStatus,
  updateDeliveryBoyDetails,
  updateDeliveryBoyRating,
  getDeliveryBoyStats,
  deleteDeliveryBoy,
};
