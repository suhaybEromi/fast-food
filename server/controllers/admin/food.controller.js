import asyncHandler from "../../middlewares/asyncHandler.js";
import Food from "../../models/food.js";
import Category from "../../models/category.js";
import slugify from "slugify";

const getFoods = asyncHandler(async (_req, res) => {
  const foods = await Food.find()
    .populate("category", "title slug")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: foods,
  });
});

const addFoods = asyncHandler(async (req, res) => {
  const { title, description, category, price, stock, status } = req.body;

  const slug = slugify(title, {
    lower: true,
    strict: true,
  });

  const image = req.file ? `/uploads/${req.file.filename}` : "";

  const foodExists = await Food.findOne({
    $or: [{ title }, { slug }],
  });

  if (foodExists) {
    const error = new Error("Food already exists");
    error.status = 400;
    throw error;
  }

  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    const error = new Error("Category not found");
    error.status = 404;
    throw error;
  }

  const food = await Food.create({
    title,
    slug,
    description,
    category,
    price,
    image,
    stock,
    status,
  });

  res.status(201).json({
    success: true,
    message: "Food created successfully",
    data: food,
  });
});

const updateFoods = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const food = await Food.findById(id);

  if (!food) {
    const error = new Error("Food not found");
    error.status = 404;
    throw error;
  }

  const updateData = { ...req.body };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  if (updateData.title) {
    updateData.slug = slugify(updateData.title, {
      lower: true,
      strict: true,
    });
  }

  const updatedFood = await Food.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Food updated successfully",
    data: updatedFood,
  });
});

const deleteFoods = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const food = await Food.findById(id);

  if (!food) {
    const error = new Error("Food not found");
    error.status = 404;
    throw error;
  }

  await Food.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Food deleted successfully",
  });
});

export default {
  getFoods,
  addFoods,
  updateFoods,
  deleteFoods,
};
