import express from "express";

import customerController from "../../controllers/admin/customer.controller.js";

const router = express.Router();

router.get("/", customerController.getCustomers);

export default router;
