const express = require("express");
const router = express.Router();
const foodController = require("../controllers/food");
const multer = require("multer");
const fs = require("fs");
const { foodValidation } = require("../validators/food");
const { validate } = require("../middlewares/validate");

// Set up multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("./images")) {
      fs.mkdirSync("./images");
    }
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, and PNG files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.get("/food", foodController.getAllFoods);

router.get("/food/:id", foodController.getFoodById);

// Apply multer only on POST route
router.post(
  "/add-food",
  upload.single("image"),
  foodValidation,
  validate,
  foodController.addFood,
);

router.put(
  "/update-food/:id",
  upload.single("image"),
  foodValidation,
  validate,
  foodController.updateFood,
);
router.delete("/delete/:id", foodController.deleteFood);

module.exports = router;
