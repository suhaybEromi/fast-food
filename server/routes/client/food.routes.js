import express from "express";
const router = express.Router();

import foodController from "../../controllers/client/food.controller.js";
import protectCustomer from "../../middlewares/customerAuth.js";

// Client: get all foods
router.get("/", foodController.getFoods);
router.get("/:id", foodController.getFood);
router.post("/:id/reviews", protectCustomer, foodController.addReview);

export default router;
