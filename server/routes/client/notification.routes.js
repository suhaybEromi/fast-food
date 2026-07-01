import express from "express";

import notificationController from "../../controllers/client/notification.controller.js";
import protectCustomer from "../../middlewares/customerAuth.js";

const router = express.Router();

router.use(protectCustomer);

router.get("/", notificationController.getNotifications);
router.patch("/read", notificationController.markRead);
router.patch("/:id/read", notificationController.markRead);

export default router;
