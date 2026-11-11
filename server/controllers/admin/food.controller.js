import asyncHandler from "../../middlewares/asyncHandler.js";
import Food from "../../models/food.js";
import Category from "../../models/category.js";
import slugify from "slugify";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";
import {
  createHttpError,
  optionalString,
  requireEnum,
  requireNumber,
  requireString,
} from "../../utils/validation.js";

const getFoods = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = optionalString(req.query.search, 80);
  const filter = {};

  if (["active", "inactive"].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  if (req.query.stock === "low") {
    filter.stock = { $gt: 0, $lte: 5 };
  }

  if (req.query.stock === "out") {
    filter.stock = 0;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const [foods, total] = await Promise.all([
    Food.find(filter)
      .populate("category", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Food.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: foods,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

const addFoods = asyncHandler(async (req, res) => {
  const { title, description, category, price, stock, status } = req.body;
  const cleanTitle = requireString(title, "Food title", 100);
  const cleanCategory = requireString(category, "Category", 80);

  const slug = slugify(cleanTitle, {
    lower: true,
    strict: true,
  });

  const image = req.file ? `/uploads/${req.file.filename}` : "";

  const foodExists = await Food.findOne({
    $or: [{ title: cleanTitle }, { slug }],
  });

  if (foodExists) {
    throw createHttpError("Food already exists");
  }

  const categoryExists = await Category.findById(cleanCategory);

  if (!categoryExists) {
    throw createHttpError("Category not found", 404);
  }

  const food = await Food.create({
    title: cleanTitle,
    slug,
    description: optionalString(description, 500),
    category: cleanCategory,
    price: requireNumber(price, "Price", { min: 0, max: 100000000 }),
    image,
    stock: Math.floor(requireNumber(stock, "Stock", { min: 0, max: 100000 })),
    status: requireEnum(status || "active", ["active", "inactive"], "Status"),
  });

  await logAudit(req, "create", "food", {
    resourceId: food._id,
    message: `Created food ${food.title}`,
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
    throw createHttpError("Food not found", 404);
  }

  const updateData = { ...req.body };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  if (updateData.title) {
    updateData.title = requireString(updateData.title, "Food title", 100);
    updateData.slug = slugify(updateData.title, {
      lower: true,
      strict: true,
    });

    const duplicate = await Food.findOne({
      _id: { $ne: id },
      $or: [{ title: updateData.title }, { slug: updateData.slug }],
    });

    if (duplicate) {
      throw createHttpError("Food title already exists");
    }
  }

  if (updateData.description !== undefined) {
    updateData.description = optionalString(updateData.description, 500);
  }

  if (updateData.price !== undefined) {
    updateData.price = requireNumber(updateData.price, "Price", {
      min: 0,
      max: 100000000,
    });
  }

  if (updateData.category !== undefined) {
    updateData.category = requireString(updateData.category, "Category", 80);
    const categoryExists = await Category.exists({ _id: updateData.category });

    if (!categoryExists) {
      throw createHttpError("Category not found", 404);
    }
  }

  if (updateData.stock !== undefined) {
    updateData.stock = Math.floor(
      requireNumber(updateData.stock, "Stock", { min: 0, max: 100000 }),
    );
  }

  if (updateData.status !== undefined) {
    updateData.status = requireEnum(
      updateData.status,
      ["active", "inactive"],
      "Status",
    );
  }

  const updatedFood = await Food.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  await logAudit(req, "update", "food", {
    resourceId: updatedFood._id,
    message: `Updated food ${updatedFood.title}`,
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
    throw createHttpError("Food not found", 404);
  }

  await Food.findByIdAndDelete(id);

  await logAudit(req, "delete", "food", {
    resourceId: id,
    message: `Deleted food ${food.title}`,
  });

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
