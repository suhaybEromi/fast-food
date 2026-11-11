import express from "express";

import dashboardController from "../../controllers/admin/dashboard.controller.js";

const router = express.Router();

router.get("/", dashboardController.getDashboardStats);

export default router;
