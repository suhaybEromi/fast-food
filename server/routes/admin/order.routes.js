import express from "express";

import orderController from "../../controllers/admin/order.controller.js";

const router = express.Router();

router.get("/", orderController.getOrders);
router.patch("/:id/status", orderController.updateOrderStatus);
router.patch("/:id/payment", orderController.updatePaymentStatus);

export default router;
