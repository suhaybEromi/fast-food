import asyncHandler from "../../middlewares/asyncHandler.js";
import Category from "../../models/category.js";
import slugify from "slugify";

const getCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

const addCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const slug = slugify(title, { lower: true, strict: true });

  const image = req.file ? `/uploads/${req.file.filename}` : "";

  const categoryExists = await Category.findOne({
    $or: [{ title }, { slug }],
  });

  if (categoryExists) {
    const error = new Error("Category already exists");
    error.status = 400;
    throw error;
  }

  const category = await Category.create({
    title,
    slug,
    image,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    const error = new Error("Category not found");
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

  const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    const error = new Error("Category not found");
    error.status = 404;
    throw error;
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

export default { getCategory, addCategory, updateCategory, deleteCategory };
