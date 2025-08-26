import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import UserModel from "../models/user.js"; // using .js because this is JS/ESM

// Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Signup
const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match", success: false });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists", success: false });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new UserModel({ name, email, password: hashed });
    await newUser.save();

    res.status(201).json({ message: "Signup successful", success: true });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", success: false });
    }

    // Ensure your User schema sets password { select: false } if you keep .select("+password")
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(403)
        .json({ message: "User not found", success: false });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(403)
        .json({ message: "Invalid password", success: false });
    }

    const token = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Forgot Password - Generate OTP
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    user.otp = hashedOTP;
    user.otpExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Your OTP for password reset is: ${otp}. It expires in 1 hour.`,
    });

    res.status(200).json({ message: "OTP sent to email", success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and OTP are required", success: false });
    }

    const user = await UserModel.findOne({ email });

    if (!user || !user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP", success: false });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "15m" }
    );

    res.status(200).json({ message: "OTP verified", success: true, resetToken });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  try {
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        message: "Email, resetToken and newPassword are required",
        success: false,
      });
    }

    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET || "fallback_secret"
    );

    if (!decoded || decoded.email !== email) {
      return res.status(400).json({ message: "Invalid token", success: false });
    }

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successfully", success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

export { signup, login, forgotPassword, verifyOtp, resetPassword };
