import express from "express";

import authController from "../../controllers/admin/auth.controller.js";
import protectAdmin from "../../middlewares/adminAuth.js";

const router = express.Router();

// router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", protectAdmin, authController.me);

export default router;
