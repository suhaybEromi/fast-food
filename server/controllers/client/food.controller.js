import asyncHandler from "../../middlewares/asyncHandler.js";
import Food from "../../models/food.js";

const getFoods = asyncHandler(async (_req, res) => {
  const foods = await Food.find({ status: "active" })
    .populate("category", "title slug")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: foods,
  });
});

const addFoods = (_req, res) => {
  res.status(405).json({
    success: false,
    message: "Client food creation is not allowed. Use the admin API.",
  });
};

const updateFoods = (_req, res) => {
  res.status(405).json({
    success: false,
    message: "Client food updates are not allowed. Use the admin API.",
  });
};

const deleteFoods = (_req, res) => {
  res.status(405).json({
    success: false,
    message: "Client food deletion is not allowed. Use the admin API.",
  });
};

export default { getFoods, addFoods, updateFoods, deleteFoods };
