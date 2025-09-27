const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    // UPI Payment Fields
    upiTransactionId: { type: String },
    upiId: { type: String },
    paymentConfirmationType: {
      type: String,
      enum: ["auto", "manual", "webhook"],
      default: "manual",
    },

    // General Payment Fields
    paymentId: { type: String },
    paidAt: { type: Date },
    failureReason: { type: String },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "UPI", "Online", "GooglePay", "MockRazorpay", "CASHFREE"],
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
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "Order Placed",
      ],
    },
    // Cashfree specific fields
    cashfreeOrderId: String,
    paymentSessionId: String,
    cashfreePaymentId: String,
    cashfreeTransactionId: String,
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
