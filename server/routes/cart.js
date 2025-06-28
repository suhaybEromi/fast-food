const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const auth = require("../middlewares/auth");

router.get("/", auth, cartController.getCart);

router.post("/add-to-cart", auth, cartController.addToCart);

router.delete("/remove/:foodId", auth, cartController.removeCart);

module.exports = router;
