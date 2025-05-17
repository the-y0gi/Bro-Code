import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minLength: [3, "Name Minimum length is 3"],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      minLength: [6, "Email Minimum length is 6"],
    },
    password: {
      type: String,
      require: true,
      trim: true,
      minLength: [3, "Password Minimum length is 3"],
    },
    image: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
    otp: { type: String },
    otpExpiry: { type: Date },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
