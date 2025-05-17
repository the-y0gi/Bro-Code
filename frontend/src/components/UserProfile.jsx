

import React, { useState, useEffect } from "react";
import { useUserContext } from "../context/UserContext";
import axios from "../config/axios";
import Loader from "../components/Loading"; // Assuming you have this loader component
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../pages/css/UserProfile.css';

const UserProfile = () => {
  const { data } = useUserContext();
  const userId = data?.user?._id;

  const [user, setUser] = useState({
    name: "",
    bio: "",
    profileImage: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data?.user) {
      setUser({
        name: data.user.name || "",
        bio: data.user.bio || "",
        profileImage: data.user.image || "", // Assuming backend uses 'image'
      });
    }
  }, [data]);

  const handleProfileUpdate = async () => {
    setLoading(true); // Show loader
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", user.name);
      formData.append("bio", user.bio);
      if (typeof user.profileImage === "object") {
        formData.append("profileImage", user.profileImage); // actual file
      }

      const response = await axios.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data.message || "Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      toast.error("Profile update failed");
      console.error("Profile update failed:", error);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...user, profileImage: file });
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true); // Show loader
    try {
      const response = await axios.put("/auth/change-password", {
        userId,
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success(response.data.message);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Error changing password.");
      console.error("Error changing password:", error);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <div className="user-profile-wrapper">
      {loading && <Loader />} {/* Show loader when loading is true */}
      <h2 className="profile-title">User Profile</h2>
      <div className="profile-content">
        <div className="profile-left">
          <img
            src={
              user.profileImage
                ? typeof user.profileImage === "string"
                  ? user.profileImage
                  : URL.createObjectURL(user.profileImage)
                : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
            }
            className="profile-avatar"
            alt="Profile"
          />
          {editMode ? (
            <>
              <input type="file" onChange={handleFileChange} />
              <input
                type="text"
                placeholder="Name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
              <textarea
                placeholder="Bio"
                value={user.bio}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
              />
              <div className="button-group">
                <button onClick={handleProfileUpdate}>Save</button>
                <button onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h3>{user.name}</h3>
              <p>{user.bio}</p>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </>
          )}
        </div>

        <div className="profile-right">
          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, currentPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, confirmPassword: e.target.value })
            }
          />
          <button onClick={handlePasswordChange}>Update Password</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
