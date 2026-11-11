import express from "express";

import deliveryZoneController from "../../controllers/admin/deliveryZone.controller.js";
import { requireAdminRole } from "../../middlewares/adminRoles.js";

const router = express.Router();

router.get("/", deliveryZoneController.getZones);
router.post("/", requireAdminRole("manager"), deliveryZoneController.createZone);
router.put("/:id", requireAdminRole("manager"), deliveryZoneController.updateZone);
router.delete(
  "/:id",
  requireAdminRole("super_admin"),
  deliveryZoneController.deleteZone,
);

export default router;
