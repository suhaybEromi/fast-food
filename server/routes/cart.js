const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const auth = require("../middlewares/auth");
const {
  addToCartValidation,
  removeFromCartValidation,
} = require("../validators/cart");
const { validate } = require("../middlewares/validate");

router.get("/", auth, cartController.getCart);

router.post(
  "/add-to-cart",
  addToCartValidation,
  validate,
  auth,
  cartController.addToCart,
);

router.delete(
  "/remove/:foodId",
  removeFromCartValidation,
  validate,
  auth,
  cartController.removeCart,
);

module.exports = router;
