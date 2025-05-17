import dotenv from "dotenv";
dotenv.config();

import { generateToken } from "../middleware/auth.middleware.js";
import User from "../models/user.models.js";
import { createUser } from "../services/user.service.js";

import nodemailer from "nodemailer";
import crypto from "crypto";
import moment from "moment";

import bcrypt from "bcrypt";

// User registration controller
export const userRegister = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    // Validate required fields
    if (!username && !email && !password) {
      return res.status(400).json("all filed are required");
    }

    // Check if user already exists
    const userExisted = await User.findOne({ email });
    if (userExisted) {
      return res.status(400).json("user already existed ");
    }

    // Image upload logic: Use uploaded image or default image
    let imageUrl;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    } else {
      imageUrl =
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";
    }

    // Create new user
    const userCreated = await createUser({
      username,
      email,
      password,
      bio,
      imageUrl,
    });
    if (!userCreated) {
      return res.status(500).json("failed to create user");
    }

    const response = await userCreated.save();

    // Generate JWT token
    const payload = { id: response.id };
    const token = generateToken(payload.id);

    res.status(201).json({ userCreated, token });
  } catch (error) {
    // Error handling for user registration
    console.error("user register issue: ", error);
    res.status(500).json({ error: "Internal Server Error0" });
  }
};

// User login controller
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json("fill all the filed");
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "something went wrong" });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "something went wrong" });
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Mark user as online
    user.isOnline = true;
    await user.save();

    res.status(200).json({ user, token });
  } catch (error) {
    // Error handling for login
    console.error("user login error : ", error);
    return res.status(500).json({ error: error.message });
  }
};

// User logout controller
export const userLogout = async (req, res) => {
  try {
    const userId = req.user;

    // Update user's online status and last seen time on logout
    const token = "";
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.status(200).json({ message: "Logout successful", token });
  } catch (error) {
    // Error handling for logout
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Home API to get user info
export const home = async (req, res) => {
  const id = req.user;
  const userId = await User.findOne({ _id: id });

  res.status(200).json({ userId });
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, bio, profileImage } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields if provided
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.image = profileImage || user.image;

    // If a new profile image is uploaded, update it
    if (req.file && req.file.path) {
      user.image = req.file.path;
    }

    // Save updated user data
    await user.save();

    res.status(200).json({ message: "Profile updated successfully!", user });
  } catch (error) {
    // Error handling for profile update
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect current password" });

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    // Error handling for password change
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// Nodemailer transporter setup for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS_KEY,
  },
});

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP for resetting your password is: ${otp}.

    
    OTP is valid only for 05:00 mins. Do not share this OTP with anyone.

Please note that the OTP is valid for only one session. If you try to refresh the page or leave the Bro-Code web app, you will be required to regenerate a new OTP.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// API to send OTP for password reset
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Set OTP expiry time to 5 minutes from now
  const otpExpiry = moment().add(5, "minutes").toISOString();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save OTP and expiry in user record
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    // Error handling for sending OTP
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// API to verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate OTP and expiry
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (moment().isAfter(moment(user.otpExpiry))) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    // Error handling for OTP verification
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// API to reset password after OTP verification
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    // Error handling for password reset
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
