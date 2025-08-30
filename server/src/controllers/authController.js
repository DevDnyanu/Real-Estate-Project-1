// server/src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";
import { sendOTPEmail } from "../utils/email.js";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const createToken = (payload, expiresIn = "24h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists by email or phone
    const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists, you can log in", success: false });
    }

    const newUser = new UserModel({ name, email, phone, password, role });
    await newUser.save();

    // Build response payload (no password)
    const payloadUser = { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role };

    res.status(201).json({
      message: "Signup successful",
      success: true,
      data: { user: payloadUser },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Request:", req.body);

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) return res.status(403).json({ message: "User not found", success: false });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Invalid password", success: false });
    }

    const token = createToken({ email: user.email, _id: user._id }, "24h");

    // send token + user inside data
    res.status(200).json({
      message: "Login successful",
      success: true,
      data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    user.otp = hashedOTP;
    user.otpExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const result = await sendOTPEmail(email, otp);
    if (!result.success) {
      return res.status(500).json({ message: "Failed to send OTP", success: false });
    }

    return res.status(200).json({ message: "OTP sent to email", success: true });
  } catch (err) {
    console.error("Forgot Password error:", err);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user || !user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP", success: false });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) return res.status(400).json({ message: "Invalid OTP", success: false });

    // Create short-lived reset token
    const resetToken = createToken({ email }, "15m");

    // Return as data so frontend can read response.data.data.resetToken
    return res.status(200).json({
      message: "OTP verified",
      success: true,
      data: { resetToken },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token", success: false });
    }

    if (decoded.email !== email) return res.status(400).json({ message: "Invalid token", success: false });

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "User not found", success: false });

    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully", success: true });
  } catch (err) {
    console.error("Reset Password error:", err);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
