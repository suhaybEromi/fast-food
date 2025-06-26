const express = require("express");
const router = express.Router();
const foodController = require("../controllers/food");
const multer = require("multer");
const fs = require("fs");
const auth = require("../middlewares/auth");

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

router.get("/food", auth, foodController.getAllFoods);

router.get("/food/:id", auth, foodController.getFoodById);

// Apply multer only on POST route
router.post("/add-food", auth, upload.single("image"), foodController.addFood);

router.put(
  "/update-food/:id",
  auth,
  upload.single("image"),
  foodController.updateFood,
);
router.delete("/delete/:id", auth, foodController.deleteFood);

module.exports = router;
