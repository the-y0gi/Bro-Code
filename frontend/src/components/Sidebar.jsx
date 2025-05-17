;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useUserContext } from "../context/UserContext";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { data, setData, setOnlineUsers, setLastSeenMap } = useUserContext();

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }

    localStorage.removeItem("user");
    setData(null);
    setOnlineUsers([]);
    setLastSeenMap({});
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="profile" onClick={() => setActiveTab("profile")}>
        <img
          src={
            data?.user?.image ||
            "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
          }
          alt="User"
          className="sidebar-profile-img"
        />
      </div>

      <nav className="nav-icons">
        <button
          className={activeTab === "chat-rooms" ? "active-icon" : ""}
          onClick={() => setActiveTab("chat-rooms")}
        >
          <i className="ri-chat-1-fill"></i>
        </button>

        <button
          className={activeTab === "notification" ? "active-icon" : ""}
          onClick={() => setActiveTab("notification")}
        >
          <i className="ri-notification-2-fill"></i>
        </button>

        <button
          className={activeTab === "all-users" ? "active-icon" : ""}
          onClick={() => setActiveTab("all-users")}
        >
          <i className="ri-user-6-fill"></i>
        </button>
      </nav>

      <div className="logout-icon" onClick={handleLogout} >
        <i className="ri-logout-circle-r-fill"></i>
      </div>
    </aside>
  );
};

export default Sidebar;
