import express from "express";

import authController from "../../controllers/client/auth.controller.js";
import protectCustomer from "../../middlewares/customerAuth.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", protectCustomer, authController.me);

export default router;
