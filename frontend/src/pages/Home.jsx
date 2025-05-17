

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

import "../pages/css/Home.css";

import Sidebar from "../components/Sidebar";
import ChatRooms from "../components/ChatRooms";
import MainChat from "../components/MainChat";

import Notification from "../components/Notification";
import AllUsers from "../components/AllUsers";
import UserProfile from "../components/UserProfile";

const Home = () => {
  const { data } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("chat-rooms");
  const [selectedChat, setSelectedChat] = useState(null);
  const [groupsShouldRefresh, setGroupsShouldRefresh] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Mobile view logic
  const renderMobileChatView = () => {
    if (activeTab === "chat-rooms") {
      if (selectedChat) {
        return (
          <MainChat
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            setGroupsShouldRefresh={setGroupsShouldRefresh}
            currentUser={data}
          />
        );
      } else {
        return (
          <ChatRooms
            setSelectedChat={setSelectedChat}
            groupsShouldRefresh={groupsShouldRefresh}
            setGroupsShouldRefresh={setGroupsShouldRefresh}
            isMobile={isMobile}
            showChatList={true}
          />
        );
      }
    } else if (activeTab === "notification") {
      return <Notification />;
    } else if (activeTab === "all-users") {
      return <AllUsers />;
    } else if (activeTab === "profile") {
      return <UserProfile />;
    }
    return null;
  };

 

  // ✅ Laptop view logic
  const renderDesktopChatView = () => {
    return (
      <>
        {/* Left section: Always show ChatRooms */}
        <ChatRooms
          setSelectedChat={setSelectedChat}
          groupsShouldRefresh={groupsShouldRefresh}
          setGroupsShouldRefresh={setGroupsShouldRefresh}
          isMobile={isMobile}
          showChatList={true}
        />

        {/* Right section: Change based on activeTab */}
        {activeTab === "chat-rooms" ? (
          <MainChat
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            setGroupsShouldRefresh={setGroupsShouldRefresh}
            currentUser={data}
          />
        ) : activeTab === "notification" ? (
          <Notification />
        ) : activeTab === "all-users" ? (
          <AllUsers />
        ) : activeTab === "profile" ? (
          <UserProfile />
        ) : null}
      </>
    );
  };

  return (
    <div className="main-layout">
      <Sidebar
        setActiveTab={(tab) => {
          setActiveTab(tab);

          // ✅ Special logic for mobile chat tab: reset selected chat
          if (tab === "chat-rooms" && window.innerWidth <= 768) {
            setSelectedChat(null);
          }
        }}
        setSelectedChat={setSelectedChat}
      />

      {isMobile ? renderMobileChatView() : renderDesktopChatView()}
    </div>
  );
};

export default Home;
