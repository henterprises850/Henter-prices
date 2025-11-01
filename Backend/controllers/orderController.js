const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");

// ============================================
// CREATE ORDER
// ============================================
const createOrder = async (req, res) => {
  try {
    console.log("=== ORDER CREATION DEBUG ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("User ID:", req.user.id);

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice = 0,
      taxPrice = 0,
    } = req.body;

    // Basic validation
    if (!orderItems || orderItems.length === 0) {
      console.log("ERROR: No order items provided");
      return res.status(400).json({
        success: false,
        message: "No order items provided",
      });
    }

    if (!req.user || !req.user.id) {
      console.log("ERROR: User not authenticated");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!shippingAddress || !shippingAddress.fullName) {
      console.log("ERROR: Invalid shipping address");
      return res.status(400).json({
        success: false,
        message: "Invalid shipping address",
      });
    }

    // Validate each order item
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      console.log(`Validating item ${i + 1}:`, item);

      if (!item.product) {
        console.log(`ERROR: Missing product ID in item ${i + 1}`);
        return res.status(400).json({
          success: false,
          message: `Missing product ID in order item ${i + 1}`,
        });
      }

      if (!item.size || typeof item.size !== "string") {
        console.log(
          `ERROR: Invalid size in item ${i + 1}:`,
          item.size,
          typeof item.size
        );
        return res.status(400).json({
          success: false,
          message: `Invalid size in order item ${
            i + 1
          }. Expected string, got ${typeof item.size}`,
        });
      }

      if (!item.color || typeof item.color !== "string") {
        console.log(
          `ERROR: Invalid color in item ${i + 1}:`,
          item.color,
          typeof item.color
        );
        return res.status(400).json({
          success: false,
          message: `Invalid color in order item ${
            i + 1
          }. Expected string, got ${typeof item.color}`,
        });
      }

      // Verify product exists
      const product = await Product.findById(item.product);
      if (!product) {
        console.log(`ERROR: Product not found: ${item.product}`);
        return res.status(404).json({
          success: false,
          message: `Product ${item.name || item.product} not found`,
        });
      }

      console.log(`Item ${i + 1} validated successfully`);
    }

    console.log("Creating order object...");

    const order = new Order({
      user: req.user.id,
      orderItems: orderItems.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: parseInt(item.quantity),
        size: String(item.size),
        color: String(item.color),
        price: parseFloat(item.price),
        image: item.image,
      })),
      shippingAddress,
      paymentMethod,
      totalPrice: parseFloat(totalPrice),
      shippingPrice: parseFloat(shippingPrice),
      taxPrice: parseFloat(taxPrice),
      paymentStatus: paymentMethod === "COD" ? "pending" : "processing",
      orderStatus: "pending",
      // Initialize status history
      statusHistory: [
        {
          status: "pending",
          updatedBy: req.user.id,
          updatedByName: req.user.name || "System",
          updatedByRole: "system",
          timestamp: new Date(),
          reason: "Order created",
        },
      ],
    });

    console.log("Saving order to database...");
    const savedOrder = await order.save();
    console.log("Order saved successfully:", savedOrder._id);

    // Update product stock
    console.log("Updating product stock...");
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart
    try {
      await Cart.findOneAndDelete({ user: req.user.id });
      console.log("Cart cleared successfully");
    } catch (cartError) {
      console.log("Cart clearing failed (non-critical):", cartError.message);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("=== ORDER CREATION ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Server error during order creation",
      error: error.message,
    });
  }
};

// ============================================
// GET ORDERS (BASIC PAGINATION)
// ============================================
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name images")
      .populate("assignedDeliveryBoy", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// GET USER ORDERS
// ============================================
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("orderItems.product", "name images")
      .populate("assignedDeliveryBoy", "name phone deliveryDetails")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// GET ORDER BY ID
// ============================================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone address")
      .populate("orderItems.product", "name images price")
      .populate("assignedDeliveryBoy", "name phone deliveryDetails");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL ORDERS (ADMIN) - WITH ADVANCED FILTERING
// ============================================
const getAllOrdersAdmin = async (req, res) => {
  try {
    const {
      search,
      orderStatus,
      paymentStatus,
      paymentMethod,
      hasDeliveryBoy, // ✅ Filter for assigned/unassigned
      dateFrom,
      dateTo,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    // ✅ Search by order ID or customer name/email/phone/address
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      console.log("Search term:", search.trim());

      let objectIdFilter = [];

      try {
        if (mongoose.Types.ObjectId.isValid(search.trim())) {
          objectIdFilter.push({
            _id: new mongoose.Types.ObjectId(search.trim()),
          });
        }
      } catch (err) {
        // Not a valid ObjectId
      }

      // Search in address fields
      objectIdFilter.push({ "shippingAddress.address": searchRegex });
      objectIdFilter.push({ "shippingAddress.fullName": searchRegex });
      objectIdFilter.push({ "shippingAddress.phone": searchRegex });

      filter.$or = objectIdFilter;
    }

    // ✅ Filter by order status
    if (orderStatus && orderStatus.trim()) {
      filter.orderStatus = orderStatus.trim();
    }

    // ✅ Filter by payment status
    if (paymentStatus && paymentStatus.trim()) {
      filter.paymentStatus = paymentStatus.trim();
    }

    // ✅ Filter by payment method
    if (paymentMethod && paymentMethod.trim()) {
      filter.paymentMethodName = paymentMethod.trim();
    }

    // ✅ FIXED: Filter by delivery boy assignment status
    if (hasDeliveryBoy) {
      console.log("hasDeliveryBoy value received:", hasDeliveryBoy);

      if (hasDeliveryBoy === "true" || hasDeliveryBoy === true) {
        // Orders WITH a delivery boy assigned (not null, not undefined)
        filter.assignedDeliveryBoy = { $ne: null };
        console.log("✅ Filter: Orders WITH delivery boy assigned");
      } else if (hasDeliveryBoy === "false" || hasDeliveryBoy === false) {
        // Orders WITHOUT a delivery boy (null or doesn't exist)
        filter.assignedDeliveryBoy = null;
        console.log("✅ Filter: Orders WITHOUT delivery boy (unassigned)");
      }
    }

    // ✅ Filter by date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // ✅ Sort options
    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "amount-high":
        sortOption = { totalPrice: -1 };
        break;
      case "amount-low":
        sortOption = { totalPrice: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log("=== Final Filter ===");
    console.log(JSON.stringify(filter, null, 2));

    // ✅ Query with proper population
    const orders = await Order.find(filter)
      .populate({
        path: "user",
        select: "name email phone",
      })
      .populate({
        path: "assignedDeliveryBoy",
        select: "name phone deliveryDetails",
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    console.log(`✅ Found ${orders.length} orders in this page`);
    console.log(`📊 Total matching orders: ${totalOrders}`);
    console.log(`📄 Total pages: ${totalPages}`);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error in getAllOrdersAdmin:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Server error fetching orders",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ============================================
// GET ORDER STATISTICS
// ============================================
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ["pending", "Order Placed"] },
    });
    const processingOrders = await Order.countDocuments({
      orderStatus: { $in: ["confirmed", "processing"] },
    });
    const shippedOrders = await Order.countDocuments({
      orderStatus: "shipped",
    });
    const deliveredOrders = await Order.countDocuments({
      orderStatus: "delivered",
    });
    const cancelledOrders = await Order.countDocuments({
      orderStatus: "cancelled",
    });

    // Calculate total revenue from completed orders
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error in getOrderStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE ORDER STATUS (WITH STATUS HISTORY)
// ============================================
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, reason } = req.body;
    const orderId = req.params.id;

    const validStatuses = [
      "pending",
      "Order Placed",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        validStatuses,
      });
    }

    // Get current order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent duplicate status
    if (order.orderStatus === orderStatus) {
      return res.status(400).json({
        success: false,
        message: `Order is already in ${orderStatus} status`,
      });
    }

    // Determine timestamps based on status
    const updateData = {
      orderStatus,
      updatedAt: new Date(),
    };

    if (orderStatus === "shipped" && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (orderStatus === "delivered" && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    if (orderStatus === "cancelled" && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    // Add to status history
    const statusEntry = {
      status: orderStatus,
      updatedBy: req.user.id,
      updatedByName: req.user.name || "Admin",
      updatedByRole: req.user.isAdmin ? "admin" : "system",
      timestamp: new Date(),
      reason: reason || "",
    };

    updateData.$push = {
      statusHistory: statusEntry,
    };

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email phone")
      .populate("assignedDeliveryBoy", "name phone");

    // TODO: Send email notification to customer
    // await sendStatusUpdateEmail(updatedOrder.user.email, orderStatus);

    res.json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// DELETE ORDER (SOFT DELETE)
// ============================================
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Soft delete - add deletedAt field and deletedBy info
    order.isDeleted = true;
    order.deletedAt = new Date();
    order.deletedBy = req.user.id;
    order.deletedByName = req.user.name || "Admin";

    await order.save();

    res.json({
      success: true,
      message: "Order deleted successfully",
      order,
    });
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// DELETE ALL ORDERS (WITH CONFIRMATION)
// ============================================
const deleteAllOrders = async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    // Verify admin password for safety
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isPasswordValid = await admin.comparePassword(confirmPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password. Orders not deleted.",
      });
    }

    // Soft delete all orders instead of hard delete
    const result = await Order.updateMany(
      { isDeleted: { $ne: true } },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
        deletedByName: req.user.name || "Admin",
      }
    );

    res.json({
      success: true,
      message: `Successfully deleted ${result.modifiedCount} order(s)`,
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in deleteAllOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting orders",
      error: error.message,
    });
  }
};

// ============================================
// ASSIGN ORDER TO DELIVERY BOY
// ============================================
const assignOrderToDeliveryBoy = async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(deliveryBoyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or delivery boy ID",
      });
    }

    // Verify delivery boy exists and is active
    const deliveryBoy = await User.findById(deliveryBoyId);
    if (!deliveryBoy || !deliveryBoy.isDeliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    if (deliveryBoy.deliveryDetails.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Delivery boy is not active",
      });
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        assignedDeliveryBoy: deliveryBoyId,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("assignedDeliveryBoy", "name phone deliveryDetails")
      .populate("user", "name email phone");

    res.json({
      success: true,
      message: "Order assigned successfully",
      order,
    });
  } catch (error) {
    console.error("Error assigning order:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// GET ACTIVE DELIVERY BOYS
// ============================================
const getActiveDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await User.find({
      isDeliveryBoy: true,
      "deliveryDetails.status": "active",
    }).select("name phone deliveryDetails");

    res.json({
      success: true,
      deliveryBoys,
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
// GET DELIVERY BOY ASSIGNED ORDERS
// ============================================
const getDeliveryBoyAssignedOrders = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({
      assignedDeliveryBoy: deliveryBoyId,
    })
      .populate("user", "name email phone")
      .populate("assignedDeliveryBoy", "name phone deliveryDetails")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoyId,
    });

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE REFUND STATUS
// ============================================
const updateRefundStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundStatus, refundTransactionId, refundNotes } = req.body;

    // ✅ Validate refund status
    const validRefundStatuses = ["pending", "processing", "completed"];
    if (!validRefundStatuses.includes(refundStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund status",
        validStatuses: validRefundStatuses,
      });
    }

    // ✅ Find order
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ Check if order is cancelled and payment was completed
    if (order.orderStatus !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Refund can only be updated for cancelled orders",
      });
    }

    if (order.paymentStatus !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Refund can only be processed if payment was completed",
      });
    }

    // ✅ Update refund status
    const updateData = {
      refundStatus,
      refundNotes: refundNotes || "",
    };

    if (refundTransactionId) {
      updateData.refundTransactionId = refundTransactionId;
    }

    // ✅ Set timestamps based on status
    if (refundStatus === "processing" && !order.refundInitiatedAt) {
      updateData.refundInitiatedAt = new Date();
    }

    if (refundStatus === "completed") {
      updateData.refundCompletedAt = new Date();
      updateData.refundInitiatedAt = order.refundInitiatedAt || new Date();
    }

    // ✅ Set refund amount
    updateData.refundAmount = order.totalPrice;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email phone")
      .populate("assignedDeliveryBoy", "name phone");

    res.json({
      success: true,
      message: `Refund status updated to ${refundStatus}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating refund status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getUserOrders,
  getOrderById,
  getAllOrdersAdmin,
  getOrderStats,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders,
  assignOrderToDeliveryBoy,
  getActiveDeliveryBoys,
  getDeliveryBoyAssignedOrders,
  updateRefundStatus,
};
