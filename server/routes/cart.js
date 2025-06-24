const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");

router.get("/:userId", cartController.getCart);

router.post("/add-to-cart", cartController.addToCart);

router.delete("/:userId/remove/:foodId", cartController.removeCart);

module.exports = router;
