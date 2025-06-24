const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order");

router.get("/:userId", orderController.getOrders);

router.post("/create-order", orderController.createOrder);

module.exports = router;
