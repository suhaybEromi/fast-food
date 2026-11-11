import express from "express";

import deliveryController from "../../controllers/client/delivery.controller.js";

const router = express.Router();

router.get("/zones", deliveryController.getZones);

export default router;
