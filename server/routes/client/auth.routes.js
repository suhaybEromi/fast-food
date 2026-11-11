import express from "express";

import authController from "../../controllers/client/auth.controller.js";
import protectCustomer from "../../middlewares/customerAuth.js";
import { createAuthRateLimit } from "../../middlewares/security.js";

const router = express.Router();

router.post("/signup", createAuthRateLimit(), authController.signup);
router.post("/login", createAuthRateLimit(), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", protectCustomer, authController.me);

export default router;
