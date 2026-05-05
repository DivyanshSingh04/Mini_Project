const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register new citizen
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, age, village, district, state } = req.body;

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: "You must be 18 or older to register.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name, email, password, phone, age, village, district, state,
      otp, otpExpires
    });

    try {
      const sendEmail = require("../utils/sendEmail");
      const message = `Welcome to e-GramSAARTHI!\n\nYour OTP for email verification is: ${otp}\nThis OTP is valid for 10 minutes.`;
      const htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to e-GramSAARTHI!</h2>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <h1 style="color: #0d9488; letter-spacing: 2px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>`;

      await sendEmail({
        email: user.email,
        subject: "e-GramSAARTHI Email Verification OTP",
        message,
        htmlMessage
      });

      res.status(201).json({
        success: true,
        message: "Registration successful! Please check your email for the OTP to verify your account.",
        email: user.email, // Send back email to use in frontend
      });
    } catch (emailError) {
      // If email fails to send, we might want to delete the user or handle it gracefully
      // For now, we will just return a message that OTP sending failed
      console.error("Error sending OTP email:", emailError);
      
      // Optionally delete the user if email is strictly required
      // await User.findByIdAndDelete(user._id);

      res.status(500).json({
        success: false,
        message: "User registered but failed to send OTP email. Please try resending OTP later.",
        email: user.email,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. Please login.",
      });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        village: user.village,
        district: user.district,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. Please login.",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    try {
      const sendEmail = require("../utils/sendEmail");
      const message = `Welcome to e-GramSAARTHI!\n\nYour new OTP for email verification is: ${otp}\nThis OTP is valid for 10 minutes.`;
      const htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>e-GramSAARTHI Email Verification</h2>
        <p>Please use the following new One-Time Password (OTP) to verify your email address:</p>
        <h1 style="color: #0d9488; letter-spacing: 2px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>`;

      await sendEmail({
        email: user.email,
        subject: "e-GramSAARTHI New OTP",
        message,
        htmlMessage
      });

      res.status(200).json({
        success: true,
        message: "A new OTP has been sent to your email.",
      });
    } catch (emailError) {
      console.error("Error sending new OTP email:", emailError);
      res.status(500).json({
        success: false,
        message: "Failed to send new OTP email. Please try again later.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address first. Check your email for the OTP.",
        needsVerification: true,
        email: user.email
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        village: user.village,
        district: user.district,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, village, district, state } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, village, district, state },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyOtp, resendOtp, login, getMe, updateProfile };
