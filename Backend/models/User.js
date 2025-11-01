// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // NEW: Delivery boy identification
    isDeliveryBoy: {
      type: Boolean,
      default: false,
    },
    deliveryDetails: {
      vehicleNumber: String,
      licenseNumber: String,
      assignedArea: String, // City or region assigned
      phoneVerified: { type: Boolean, default: false },
      documentsVerified: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "inactive",
      },
      joinDate: { type: Date, default: Date.now },
      totalDeliveries: { type: Number, default: 0 },
      successfulDeliveries: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
