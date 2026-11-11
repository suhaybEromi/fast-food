import express from "express";

import couponController from "../../controllers/admin/coupon.controller.js";
import { requireAdminRole } from "../../middlewares/adminRoles.js";

const router = express.Router();

router.get("/", couponController.getCoupons);
router.post("/", requireAdminRole("manager"), couponController.createCoupon);
router.put("/:id", requireAdminRole("manager"), couponController.updateCoupon);
router.delete("/:id", requireAdminRole("super_admin"), couponController.deleteCoupon);

export default router;
