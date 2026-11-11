import express from "express";

import bannerController from "../../controllers/admin/banner.controller.js";
import { requireAdminRole } from "../../middlewares/adminRoles.js";
import uploadBannerMedia from "../../middlewares/uploadBannerMedia.js";

const router = express.Router();

router.get("/", bannerController.getBanners);
router.post(
  "/",
  requireAdminRole("manager"),
  uploadBannerMedia.single("media"),
  bannerController.createBanner,
);
router.put(
  "/:id",
  requireAdminRole("manager"),
  uploadBannerMedia.single("media"),
  bannerController.updateBanner,
);
router.delete("/:id", requireAdminRole("super_admin"), bannerController.deleteBanner);

export default router;
