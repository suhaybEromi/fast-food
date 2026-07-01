import express from "express";

import orderController from "../../controllers/client/order.controller.js";
import protectCustomer from "../../middlewares/customerAuth.js";

const router = express.Router();

router.use(protectCustomer);

router.post("/", orderController.createOrder);
router.get("/mine", orderController.getMyOrders);
router.get("/:id", orderController.getOrder);

export default router;
