const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  saveCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/save", saveCart); // New route to save entire cart
router.put("/update", updateCartItem);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
