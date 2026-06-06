import express from "express";
const router = express.Router();
import categoryController from "../../controllers/admin/category.controller.js";
import uploadImage from "../../middlewares/uploadImage.js";

// Admin: get all category
router.get("/", categoryController.getCategory);

// Admin: create category
router.post("/", uploadImage.single("image"), categoryController.addCategory);

// Admin: update category
router.put(
  "/:id",
  uploadImage.single("image"),
  categoryController.updateCategory,
);

// Admin: delete category
router.delete("/:id", categoryController.deleteCategory);

export default router;
