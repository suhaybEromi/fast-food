import express from "express";

import analyticsController from "../../controllers/admin/analytics.controller.js";

const router = express.Router();

router.get("/", analyticsController.getAnalytics);

export default router;
