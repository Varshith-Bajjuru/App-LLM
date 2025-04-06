const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const EmailService = require("../services/emailService");
const rateLimit = require("express-rate-limit");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_VERIFICATION_TOKEN,
      { expiresIn: "24h" }
    );

    const user = new User({
      email,
      password,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();
    await EmailService.sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        needsVerification: true,
      });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

exports.checkAuth = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json({ user: { id: decoded.id } });
  });
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESS_TOKEN,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token", error });
  }
};

exports.verifyEmail = async (req, res) => {
  // Get token from either query params (GET) or body (POST)
  const token = req.query.token || req.body.token;

  if (!token) {
    return res.status(400).json({
      message: "Verification token is required",
      verified: false,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_VERIFICATION_TOKEN);

    const user = await User.findOne({
      email: decoded.email,
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired verification token. Please request a new verification email.",
        verified: false,
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully! You can now log in.",
      verified: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).json({
      message:
        "Invalid verification token. Please try again or request a new verification email.",
      verified: false,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_RESET_TOKEN, {
      expiresIn: "1h",
    });

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    await EmailService.sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error processing request" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_TOKEN);
    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid reset token" });
  }
};

// Add a resend verification email endpoint
exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_VERIFICATION_TOKEN,
      { expiresIn: "24h" }
    );

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send new verification email
    await EmailService.sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      message: "Verification email resent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      message: "Error sending verification email. Please try again.",
    });
  }
};
