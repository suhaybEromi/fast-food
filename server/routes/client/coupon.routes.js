import express from "express";

import couponController from "../../controllers/client/coupon.controller.js";

const router = express.Router();

router.get("/:code", couponController.getCoupon);

export default router;
