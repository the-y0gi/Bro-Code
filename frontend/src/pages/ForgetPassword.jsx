
import React, { useState } from "react";
import axios from "../config/axios";
import "../pages/css/ForgetPassword.css";
import { useNavigate } from "react-router-dom";

import Loader from "../components/Loading";
import { toast } from "react-toastify";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/send-otp", { email });
      setMessage(res.data.message || "OTP sent to your email.");
      setStep(2);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/verify-otp", { email, otp });
      setMessage(res.data.message || "OTP verified.");
      setStep(3);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
  e.preventDefault();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  if (!passwordRegex.test(newPassword)) {
    toast.error(
      "Password must be at least 6 characters long and include uppercase, lowercase letters, and a number."
    );
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post("/auth/reset-password", {
      email,
      newPassword,
    });
    setMessage(res.data.message || "Password reset successfully.");
    toast.success("Password reset successfully. Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
        "Failed to reset password. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="forget-wrapper">
      {loading && <Loader />}
      <div className="forget-card">
        <h2>FORGOT PASSWORD</h2>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit">Change Password</button>
          </form>
        )}

        {message && <p className="status">{message}</p>}

        <div className="back-links">
          <a href="/login">← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
