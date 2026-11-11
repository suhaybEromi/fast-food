import express from "express";
const router = express.Router();

import foodController from "../../controllers/admin/food.controller.js";
import uploadImage from "../../middlewares/uploadImage.js";
import { requireAdminRole } from "../../middlewares/adminRoles.js";

// Admin: get all foods
router.get("/", foodController.getFoods);

// Admin: create food
router.post(
  "/",
  requireAdminRole("manager"),
  uploadImage.single("image"),
  foodController.addFoods,
);

// Admin: update food
router.put(
  "/:id",
  requireAdminRole("manager"),
  uploadImage.single("image"),
  foodController.updateFoods,
);

// Admin: delete food
router.delete("/:id", requireAdminRole("super_admin"), foodController.deleteFoods);

export default router;
