const Food = require("../models/food");
const fs = require("fs");

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
    console.error("Error in getAllFoods:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getFoodById = async (req, res, next) => {
  const foodId = req.params.id;
  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.status(200).json({ message: "Food item retrieved successfully", food });
  } catch (error) {
    console.error("Error in getFoodById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addFood = async (req, res, next) => {
  const { name, description, price, category } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

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
    console.error("Error in addFood:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateFood = async (req, res, next) => {
  const foodId = req.params.id;
  const { name, description, price, category } = req.body;

  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Authorization check
    if (food.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this food item" });
    }

    // Validate image presence if no old image and no new file
    if (!req.file && !food.imageUrl) {
      return res.status(400).json({ message: "Image file is required" });
    }

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
          console.warn("Could not delete old image:", err.message);
        }
      }
      food.imageUrl = req.file.path;
    }

    await food.save();

    res.status(200).json({ message: "Food item updated successfully", food });
  } catch (error) {
    console.error("Error in updateFood:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteFood = async (req, res, next) => {
  const foodId = req.params.id;
  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Authorization check
    if (food.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this food item" });
    }

    // Delete image file if exists
    if (food.imageUrl && fs.existsSync(food.imageUrl)) {
      try {
        fs.unlinkSync(food.imageUrl);
      } catch (err) {
        console.warn("Could not delete image:", err.message);
      }
    }

    await Food.findByIdAndUpdate(foodId);

    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteFood:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
