const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");
const sampleProducts = require("../data/sampleProducts");

dotenv.config();

const seedProducts = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce-clothing"
    );

    // Clear existing products
    await Product.deleteMany({});
    console.log("Existing products cleared");

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log("Sample products inserted");

    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedProducts();
