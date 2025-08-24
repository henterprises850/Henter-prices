const express = require("express");
const {
  getProducts,
  getProductById,
  getBestsellerProducts,
  getLatestProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/bestseller", getBestsellerProducts);
router.get("/latest", getLatestProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
