const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/check", authController.checkAuth);

router.post("/logout", authController.logout);

router.post("/refresh-token", authController.refreshToken);

router.post("/resend-verification", authController.resendVerification);

router.post("/verify-email", authController.verifyEmail);

router.get("/verify-email", authController.verifyEmail);

module.exports = router;
