const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { loginLimiter, registerLimiter, forgotPasswordLimiter } = require("../middleware/rateLimiter");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
} = require("../middleware/validators");

const router = express.Router();

router.post("/register", registerLimiter, registerValidation, authController.register);
router.post("/login", loginLimiter, loginValidation, authController.login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordValidation, authController.forgotPassword);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
