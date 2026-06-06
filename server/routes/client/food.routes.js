import express from "express";
const router = express.Router();

import foodController from "../../controllers/client/food.controller.js";

// Client: get all foods
router.get("/", foodController.getFoods);

// Client: create food
router.post("/", foodController.addFoods);

// Client: update food
router.put("/:id", foodController.updateFoods);

// Client: delete food
router.delete("/:id", foodController.deleteFoods);

export default router;
