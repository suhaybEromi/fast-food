const Food = require("../models/food");
const fs = require("fs");

exports.getAllFoods = async (req, res, next) => {
  try {
    const foods = await Food.find();
    res.status(200).json({ message: "Foods retrieved successfully", foods });
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

exports.getFoodCategory = async (req, res, next) => {
  try {
    const food = await Food.find().populate("category");
    res
      .status(200)
      .json({ message: "Food item category retrieved successfully", food });
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
      price,
      category,
      imageUrl,
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
    const food = await Food.findByIdAndUpdate(
      foodId,
      { name, description, price, category },
      { new: true },
    );
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    if (!req.file && !food.imageUrl) {
      return res.status(400).json({ message: "Image file is required" });
    }

    if (req.file) {
      if (food.imageUrl && fs.existsSync(food.imageUrl)) {
        try {
          fs.unlinkSync(food.imageUrl); // delete old image file
        } catch (err) {
          console.warn("Could not delete old image:", err.message);
        }
      }
      food.imageUrl = req.file.path; // set new image path
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
    const food = await Food.findByIdAndDelete(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    if (!food.imageUrl) {
      return res.status(400).json({ message: "Image file is required" });
    }

    if (food.imageUrl && fs.existsSync(food.imageUrl)) {
      try {
        fs.unlinkSync(food.imageUrl); // delete image file
      } catch (err) {
        console.warn("Could not delete image:", err.message);
      }
    }
    // Successfully deleted food item

    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteFood:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
