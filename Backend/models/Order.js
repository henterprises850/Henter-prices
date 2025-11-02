const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
        },
        size: String,
        color: String,
        price: {
          type: Number,
          required: true,
        },
        image: String,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      state: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, default: 0, min: 0 },
    taxPrice: { type: Number, default: 0, min: 0 },

    // Payment Fields
    upiTransactionId: { type: String },
    upiId: { type: String },
    paymentConfirmationType: {
      type: String,
      enum: ["auto", "manual", "webhook"],
      default: "manual",
    },
    paymentId: { type: String },
    paidAt: { type: Date },
    failureReason: { type: String },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },

    // ✅ FIXED: paymentMethod can be string OR object
    paymentMethod: {
      type: mongoose.Schema.Types.Mixed, // Changed from String to Mixed
      required: true,
      default: "COD",
    },

    // ✅ NEW: Store payment method name separately for queries
    paymentMethodName: {
      type: String,
      enum: [
        "COD",
        "UPI",
        "Online",
        "GooglePay",
        "CASHFREE",
        "Card",
        "SABPAISA",
      ],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
    },
    orderStatus: {
      type: String,
      default: "pending",
      enum: [
        "pending",
        "Order Placed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },

    // Cashfree specific fields
    cashfreeOrderId: String,
    paymentSessionId: String,
    cashfreePaymentId: String,
    cashfreeTransactionId: String,

    // ✅ NEW: Store full Cashfree payment details
    cashfreePaymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Status update tracking
    statusHistory: [
      {
        status: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        updatedByName: String,
        updatedByRole: {
          type: String,
          enum: ["admin", "deliveryBoy"],
        },
        timestamp: { type: Date, default: Date.now },
        reason: String,
      },
    ],

    // Delivery tracking
    shippingTrackingNumber: String,
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    deliveryNotes: String,

    // Refund Fields
    refundStatus: {
      type: String,
      enum: ["not_applicable", "pending", "processing", "completed"],
      default: "pending",
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundInitiatedAt: { type: Date },
    refundCompletedAt: { type: Date },
    refundTransactionId: String,
    refundNotes: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedByName: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ assignedDeliveryBoy: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ paymentMethodName: 1 });
orderSchema.index({ refundStatus: 1 });
orderSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Order", orderSchema);
