const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart");

router.post("/cart/:userId", cartController.getCart);

router.post("/add-to-cart", cartController.addToCart);

module.exports = router;
