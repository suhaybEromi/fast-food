import express from "express";

import adminUserController from "../../controllers/admin/adminUser.controller.js";
import { requireAdminRole } from "../../middlewares/adminRoles.js";

const router = express.Router();

router.use(requireAdminRole("super_admin"));

router.get("/", adminUserController.getAdmins);
router.post("/", adminUserController.createAdmin);
router.patch("/:id/role", adminUserController.updateAdminRole);
router.delete("/:id", adminUserController.deleteAdmin);

export default router;
