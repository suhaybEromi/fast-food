import express from "express";

import auditLogController from "../../controllers/admin/auditLog.controller.js";
import { requireAdminRole } from "../../middlewares/adminRoles.js";

const router = express.Router();

router.get("/", requireAdminRole("manager"), auditLogController.getAuditLogs);

export default router;
