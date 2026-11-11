import express from "express";

import driverController from "../../controllers/admin/driver.controller.js";
import { requireAdminRole } from "../../middlewares/adminRoles.js";

const router = express.Router();

router.get("/", driverController.getDrivers);
router.post("/", requireAdminRole("manager"), driverController.createDriver);
router.put("/:id", requireAdminRole("manager"), driverController.updateDriver);
router.delete("/:id", requireAdminRole("super_admin"), driverController.deleteDriver);

export default router;
