const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

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
        size: String(item.size), // Ensure string
        color: String(item.color), // Ensure string
        price: parseFloat(item.price),
        image: item.image,
      })),
      shippingAddress,
      paymentMethod,
      totalPrice: parseFloat(totalPrice),
      shippingPrice: parseFloat(shippingPrice),
      taxPrice: parseFloat(taxPrice),
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

const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name images")
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

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("orderItems.product", "name images")
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

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("orderItems.product", "name images");

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

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "Order Placed",
      "Packing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
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

module.exports = {
  createOrder,
  getOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
};
