const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
  getProductStats,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/latest", getProducts);
router.get("/bestseller", getProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/bulk-create", protect, admin, bulkCreateProducts);
router.get("/admin/stats", protect, admin, getProductStats);

module.exports = router;
