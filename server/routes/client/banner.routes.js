import express from "express";

import bannerController from "../../controllers/client/banner.controller.js";

const router = express.Router();

router.get("/", bannerController.getBanners);

export default router;
