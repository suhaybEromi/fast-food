const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  createOrderValidation,
  getOrdersValidation,
} = require("../validators/order");
const { validate } = require("../middlewares/validate");

const orderController = require("../controllers/order");

router.get(
  "/:userId",
  getOrdersValidation,
  validate,
  auth,
  orderController.getOrders,
);

router.post(
  "/create-order",
  createOrderValidation,
  validate,
  auth,
  orderController.createOrder,
);

module.exports = router;
