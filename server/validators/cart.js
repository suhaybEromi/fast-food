const { body, param } = require("express-validator");

exports.addToCartValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID"),

  body("foodId")
    .notEmpty()
    .withMessage("Food ID is required")
    .isMongoId()
    .withMessage("Invalid Food ID"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

exports.removeFromCartValidation = [
  param("foodId")
    .notEmpty()
    .withMessage("Food ID is required")
    .isMongoId()
    .withMessage("Invalid Food ID"),
];
