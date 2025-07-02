const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { signupValidation, loginValidation } = require("../validators/user");
const { validate } = require("../middlewares/validate");

router.post("/signup", signupValidation, validate, userController.signup);

router.post("/login", loginValidation, validate, userController.login);

router.post("/logout", userController.logout);

module.exports = router;
