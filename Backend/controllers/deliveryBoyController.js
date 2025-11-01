const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");

// ============================================
// GET ASSIGNED ORDERS
// ============================================
const getAssignedOrders = async (req, res) => {
  try {
    // ✅ Convert deliveryBoyId to ObjectId
    let deliveryBoyId;
    try {
      deliveryBoyId = new mongoose.Types.ObjectId(req.user.id);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const { status, search, page = 1, limit = 10 } = req.query;

    console.log("Delivery Boy ID:", deliveryBoyId);
    console.log("Request User:", req.user);

    // ✅ Verify user is a delivery boy
    const user = await User.findById(deliveryBoyId);

    console.log("User found:", user);
    console.log("Is Delivery Boy:", user?.isDeliveryBoy);

    if (!user || !user.isDeliveryBoy) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not a delivery boy.",
      });
    }

    // ✅ Check if delivery boy is active
    if (user.deliveryDetails.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // ✅ Create filter with ObjectId
    let filter = {
      assignedDeliveryBoy: deliveryBoyId,
    };

    console.log("Filter before status/search:", filter);

    // Filter by status if provided
    if (status && status.trim()) {
      filter.orderStatus = status.trim();
    } else {
      // Default: show only active orders (processing, shipped)
      filter.orderStatus = { $in: ["processing", "shipped"] };
    }

    // ✅ Improved search logic
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { "shippingAddress.fullName": searchRegex },
        { "shippingAddress.phone": searchRegex },
      ];

      // Try to search by order ID if valid ObjectId
      try {
        if (mongoose.Types.ObjectId.isValid(search.trim())) {
          filter.$or.push({
            _id: new mongoose.Types.ObjectId(search.trim()),
          });
        }
      } catch (err) {
        console.log("Search term is not a valid ObjectId");
      }
    }

    console.log("Final filter:", JSON.stringify(filter, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Execute query with detailed logging
    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("assignedDeliveryBoy", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    console.log("Orders found:", orders.length);
    console.log("Total orders:", totalOrders);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching assigned orders:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE ORDER STATUS (SINGLE NEXT STATUS)
// ============================================
const updateOrderStatusAsDeliveryBoy = async (req, res) => {
  try {
    // ✅ Convert deliveryBoyId to ObjectId
    let deliveryBoyId;
    try {
      deliveryBoyId = new mongoose.Types.ObjectId(req.user.id);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const orderId = req.params.id;
    const { orderStatus, deliveryNotes, cancellationReason } = req.body;

    console.log("Delivery Boy ID:", deliveryBoyId);
    console.log("Order ID:", orderId);
    console.log("New Status:", orderStatus);

    // ✅ Verify user is a delivery boy
    const deliveryBoy = await User.findById(deliveryBoyId);

    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not a delivery boy.",
      });
    }

    // ✅ Check if delivery boy is active
    if (deliveryBoy.deliveryDetails.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // ✅ Find order and verify assignment
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(new mongoose.Types.ObjectId(orderId));

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ Verify order is assigned to this delivery boy
    console.log("Order assigned to:", order.assignedDeliveryBoy);
    console.log("Current delivery boy:", deliveryBoyId);

    if (order.assignedDeliveryBoy.toString() !== deliveryBoyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Order not assigned to you",
      });
    }

    // ✅ Define valid transitions (SINGLE NEXT STATUS ONLY)
    const validTransitions = {
      processing: "shipped",
      shipped: "delivered",
      delivered: null,
    };

    const currentStatus = order.orderStatus;
    const allowedNextStatus = validTransitions[currentStatus];

    // ✅ Check if requested status matches the only allowed next status
    if (orderStatus !== allowedNextStatus) {
      const allowedStatuses = allowedNextStatus ? [allowedNextStatus] : [];
      return res.status(400).json({
        success: false,
        message: `Current status is '${currentStatus}'. Next allowed status is '${
          allowedNextStatus || "none"
        }'.`,
        currentStatus,
        allowedNextStatus: allowedStatuses,
      });
    }

    // ✅ Update order data
    const updateData = {
      orderStatus,
      updatedAt: new Date(),
    };

    // ✅ Set timestamps based on status
    if (orderStatus === "shipped") {
      updateData.shippedAt = new Date();
    } else if (orderStatus === "delivered") {
      updateData.deliveredAt = new Date();
      // ✅ Update delivery boy stats
      deliveryBoy.deliveryDetails.totalDeliveries += 1;
      deliveryBoy.deliveryDetails.successfulDeliveries += 1;
      await deliveryBoy.save();
    }

    // ✅ Add delivery notes if provided
    if (deliveryNotes && deliveryNotes.trim()) {
      updateData.deliveryNotes = deliveryNotes.trim();
    }

    // ✅ Add to status history
    const statusHistoryEntry = {
      status: orderStatus,
      updatedBy: deliveryBoyId,
      updatedByName: deliveryBoy.name,
      updatedByRole: "deliveryBoy",
      timestamp: new Date(),
      reason: cancellationReason || "",
    };

    updateData.statusHistory = order.statusHistory || [];
    updateData.statusHistory.push(statusHistoryEntry);

    // ✅ Update and return order
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email phone")
      .populate("assignedDeliveryBoy", "name phone");

    res.json({
      success: true,
      message: `Order status updated to '${orderStatus}' successfully`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// GET DELIVERY BOY STATS
// ============================================
const getDeliveryBoyStats = async (req, res) => {
  try {
    // ✅ Convert deliveryBoyId to ObjectId
    let deliveryBoyId;
    try {
      deliveryBoyId = new mongoose.Types.ObjectId(req.user.id);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // ✅ Verify user is a delivery boy
    const deliveryBoy = await User.findById(deliveryBoyId);
    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // ✅ Get order statistics using ObjectId
    const totalAssigned = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
    });

    const processing = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
      orderStatus: "processing",
    });

    const shipped = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
      orderStatus: "shipped",
    });

    const delivered = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
      orderStatus: "delivered",
    });

    res.json({
      success: true,
      stats: {
        totalAssigned,
        processing,
        shipped,
        delivered,
        totalDeliveries: deliveryBoy.deliveryDetails.totalDeliveries || 0,
        successfulDeliveries:
          deliveryBoy.deliveryDetails.successfulDeliveries || 0,
        rating: deliveryBoy.deliveryDetails.rating || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching delivery boy stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// GET DELIVERY BOY PROFILE
// ============================================
const getDeliveryBoyProfile = async (req, res) => {
  try {
    // ✅ Convert deliveryBoyId to ObjectId
    let deliveryBoyId;
    try {
      deliveryBoyId = new mongoose.Types.ObjectId(req.user.id);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // ✅ Verify user is a delivery boy
    const deliveryBoy = await User.findById(deliveryBoyId).select("-password");

    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      deliveryBoy,
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAssignedOrders,
  updateOrderStatusAsDeliveryBoy,
  getDeliveryBoyStats,
  getDeliveryBoyProfile,
};
