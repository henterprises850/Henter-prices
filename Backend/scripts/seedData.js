// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const Product = require("../models/Product");
// const sampleProducts = require("../data/sampleProducts");

// dotenv.config();

// const seedProducts = async () => {
//   try {
//     await mongoose.connect(
//       process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce-clothing"
//     );

//     // Clear existing products
//     await Product.deleteMany({});
//     console.log("Existing products cleared");

//     // Insert sample products
//     await Product.insertMany(sampleProducts);
//     console.log("Sample products inserted");

//     process.exit();
//   } catch (error) {
//     console.error("Error seeding data:", error);
//     process.exit(1);
//   }
// };

// seedProducts();

const crypto = require("crypto");

// ✅ Generate 256-bit key (64 hex characters)
const key256 = crypto.randomBytes(32).toString("hex");
console.log("SABPAISA_AUTH_KEY (256-bit):");
console.log(key256);
console.log("Length:", key256.length, "characters (should be 64)");
console.log("");

// ✅ Generate 128-bit IV (32 hex characters)
const iv128 = crypto.randomBytes(16).toString("hex");
console.log("SABPAISA_AUTH_IV (128-bit):");
console.log(iv128);
console.log("Length:", iv128.length, "characters (should be 32)");
