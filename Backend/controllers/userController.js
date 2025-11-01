const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, email, password, phone, isDeliveryBoy, deliveryDetails } =
      req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      phone,
      isAdmin: false, // Never allow self-registration as admin
      isDeliveryBoy: isDeliveryBoy || false,
    };

    // Add delivery details if registering as delivery boy
    if (isDeliveryBoy && deliveryDetails) {
      userData.deliveryDetails = {
        vehicleNumber: deliveryDetails.vehicleNumber,
        licenseNumber: deliveryDetails.licenseNumber,
        assignedArea: deliveryDetails.assignedArea,
        phoneVerified: false,
        documentsVerified: false,
        status: "inactive", // Requires admin approval
        joinDate: new Date(),
        totalDeliveries: 0,
        successfulDeliveries: 0,
        rating: 0,
      };
    }

    const user = await User.create(userData);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isDeliveryBoy: user.isDeliveryBoy,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ✅ NEW: Check if user is a delivery boy and verify their status
    if (user.isDeliveryBoy) {
      if (user.deliveryDetails.status !== "active") {
        return res.status(403).json({
          success: false,
          message: `Your delivery boy account is currently ${user.deliveryDetails.status}. Please contact the administrator to activate your account.`,
          userRole: "deliveryBoy",
          accountStatus: user.deliveryDetails.status,
        });
      }

      // Check if documents and phone are verified
      if (
        !user.deliveryDetails.documentsVerified ||
        !user.deliveryDetails.phoneVerified
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is pending verification. Please contact the administrator.",
          userRole: "deliveryBoy",
          accountStatus: "pending_verification",
        });
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isDeliveryBoy: user.isDeliveryBoy,
        role: user.isAdmin
          ? "admin"
          : user.isDeliveryBoy
          ? "deliveryBoy"
          : "customer",
        address: user.address,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, phone, address } = req.body;

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
