// server/src/routes/auth.js
import express from "express";
import { signup, login, forgotPassword, verifyOtp, resetPassword } from "../controllers/authController.js";
import { signupValidation, loginValidation } from "../Middlewares/authValidation.js";

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
