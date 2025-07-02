const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { signupValidation, loginValidation } = require("../validators/user");
const { validate } = require("../middlewares/validate");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many attempts, please try again in 10 minutes.",
});

router.post(
  "/signup",
  authLimiter,
  signupValidation,
  validate,
  userController.signup,
);

router.post(
  "/login",
  authLimiter,
  loginValidation,
  validate,
  userController.login,
);

router.post("/logout", userController.logout);

module.exports = router;
