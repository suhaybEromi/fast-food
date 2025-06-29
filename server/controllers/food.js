const Food = require("../models/food");
const fs = require("fs");
const createError = require("../middlewares/createError");

exports.getAllFoods = async (req, res, next) => {
  try {
    const foods = await Food.find();

    const formattedFoods = foods.map(food => ({
      ...food._doc,
      price: Number(food.price),
    }));

    res.status(200).json({
      message: "Foods retrieved successfully",
      foods: formattedFoods,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFoodById = async (req, res, next) => {
  const foodId = req.params.id;
  try {
    const food = await Food.findById(foodId);
    if (!food) return next(createError(404, "Food item not found"));

    res.status(200).json({ message: "Food item retrieved successfully", food });
  } catch (error) {
    next(error);
  }
};

exports.addFood = async (req, res, next) => {
  const { name, description, price, category } = req.body;

  if (!req.file) return next(createError(400, "Image file is required"));

  const imageUrl = req.file.path;

  try {
    const newFood = new Food({
      name,
      description,
      price: parseFloat(price),
      category,
      imageUrl,
      user: req.user,
    });

    await newFood.save();
    res
      .status(201)
      .json({ message: "Food item added successfully", food: newFood });
  } catch (error) {
    if (fs.existsSync(imageUrl)) {
      fs.unlinkSync(imageUrl);
    }
    next(error);
  }
};

exports.updateFood = async (req, res, next) => {
  const foodId = req.params.id;
  const { name, description, price, category } = req.body;

  try {
    const food = await Food.findById(foodId);
    if (!food) return next(createError(404, "Food item not found"));

    // Authorization check
    if (food.user.toString() !== req.user._id.toString())
      return next(
        createError(403, "You are not allowed to update this food item"),
      );

    // Validate image presence if no old image and no new file
    if (!req.file && !food.imageUrl)
      return next(createError(400, "Image file is required"));

    // Update fields
    food.name = name;
    food.description = description;
    food.price = parseFloat(price);
    food.category = category;
    food.user = req.user;

    if (req.file) {
      // Delete old image if exists
      if (food.imageUrl && fs.existsSync(food.imageUrl)) {
        try {
          fs.unlinkSync(food.imageUrl);
        } catch (err) {
          return next(
            createError(500, `Could not delete old image: ${err.message}`),
          );
        }
      }
      food.imageUrl = req.file.path;
    }

    await food.save();

    res.status(200).json({ message: "Food item updated successfully", food });
  } catch (error) {
    next(error);
  }
};

exports.deleteFood = async (req, res, next) => {
  const foodId = req.params.id;
  try {
    const food = await Food.findById(foodId);
    if (!food) return next(createError(404, "Food item not found"));

    // Authorization check
    if (food.user.toString() !== req.user._id.toString())
      return next(
        createError(403, "You are not allowed to delete this food item"),
      );

    // Delete image file if exists
    if (food.imageUrl && fs.existsSync(food.imageUrl)) {
      try {
        fs.unlinkSync(food.imageUrl);
      } catch (err) {
        return next(
          createError(500, `Could not delete old image: ${err.message}`),
        );
      }
    }

    await Food.findByIdAndDelete(foodId);

    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    next(error);
  }
};
