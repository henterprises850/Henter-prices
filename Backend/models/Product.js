const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Kids", "Accessories"],
    },
    subCategory: {
      type: String,
      required: true,
      enum: ["Topwear", "Bottomwear", "Winterwear", "Shoes", "Bags", "Jewelry"],
    },
    sizes: [
      {
        type: String,
        enum: [
          // Standard clothing sizes
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "XXL",
          "XXXL",
          // Kids age sizes
          "2-3Y",
          "4-5Y",
          "6-7Y",
          "8-9Y",
          "10-11Y",
          "12-13Y",
          "14-15Y",
          // Numeric sizes for jeans/pants
          "28",
          "30",
          "32",
          "34",
          "36",
          "38",
          "40",
          "42",
          "44",
          // Shoe sizes
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          // Free size
          "Free Size",
          "One Size",
        ],
      },
    ],
    colors: [String],
    images: [String],
    bestseller: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
