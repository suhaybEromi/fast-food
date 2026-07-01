import express from "express";

import notificationController from "../../controllers/admin/notification.controller.js";

const router = express.Router();

router.get("/", notificationController.getNotifications);
router.patch("/read", notificationController.markRead);
router.patch("/:id/read", notificationController.markRead);

export default router;
