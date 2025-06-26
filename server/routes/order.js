const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

const orderController = require("../controllers/order");

router.get("/:userId", auth, orderController.getOrders);

router.post("/create-order", auth, orderController.createOrder);

module.exports = router;
