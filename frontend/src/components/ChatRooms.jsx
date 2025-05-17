
import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import CreateGroupModal from "./CreatedGroupModal";
import Loader from "../components/Loading";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../pages/css/ChatRoom.css";
import { useSocket } from "../context/SocketContext"; // ✅ Import useSocket

const ChatRooms = ({
  setSelectedChat,
  groupsShouldRefresh,
  setGroupsShouldRefresh,
  showChatList,
  isMobile,
}) => {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const socket = useSocket(); // ✅ Use socket from context


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleClick = (user) => {
    setSelectedChat({
      name: user.username,
      isOnline: user.isOnline,
      id: user._id,
      image: user.image,
    });
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleGroupClick = (group) => {
    const groupId = group._id || group.id;
    setSelectedChat({
      admin: group.admin,
      name: group.groupname,
      status: "Group Chat",
      id: groupId,
      members: group.members,
      image: group.image,
    });
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const formatTime = (isoString) => {
   
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/user/friends");
      setFriends(res.data.friendDetails);
    } catch (error) {
      toast.error("Failed to load friends");
      console.error("Friends fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/groups/groups-show");
      setGroups(res.data.groups);
    } catch (error) {
      toast.error("Failed to load groups");
      console.error("Groups fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groupsShouldRefresh) {
      fetchGroups();
      setGroupsShouldRefresh(false);
    }
  }, [groupsShouldRefresh]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (socket) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        // Emit user-online event
        socket.emit("user-online", userId);
      }

      // Listen for online-users-list to update the online status of friends/groups
      socket.on("online-users-list", (userList) => {
        setFriends((prevFriends) =>
          prevFriends.map((friend) => ({
            ...friend,
            isOnline: userList.includes(friend._id),
          }))
        );

        setGroups((prevGroups) =>
          prevGroups.map((group) => ({
            ...group,
            isOnline: group.members?.some((member) =>
              userList.includes(member._id || member)
            ),
          }))
        );
      });

      // Listen for user-last-seen event to update the last seen time of users
      socket.on("user-last-seen", ({ userId, lastSeen }) => {
        setFriends((prevFriends) =>
          prevFriends.map((friend) =>
            friend._id === userId ? { ...friend, lastSeen } : friend
          )
        );
        setGroups((prevGroups) =>
          prevGroups.map((group) => ({
            ...group,
            lastSeen: group.members?.some(
              (member) => member._id === userId
            )
              ? lastSeen
              : group.lastSeen,
          }))
        );
      });

      return () => {
        socket.off("online-users-list");
        socket.off("user-last-seen");
      };
    }
  }, [socket]);

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.groupname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="chat-room"
      style={isMobile ? { display: showChatList ? "block" : "none" } : {}}
    >
      {loading && <Loader />}

      <div className="logo-name">
        <h1>BroCode</h1>
      </div>

      <div className="search-bar">
        <i className="ri-search-line"></i>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {showSuggestions && (
        <div className="suggestion-box">
          {filteredGroups.map((group) => (
            <div
              key={group._id}
              className="suggestion-item"
              onClick={() => handleGroupClick(group)}
            >
              👨🏻‍👩🏻‍👦🏻‍👦🏻 {group.groupname}
            </div>
          ))}
          {filteredFriends.map((friend) => (
            <div
              key={friend._id}
              className="suggestion-item"
              onClick={() => handleClick(friend)}
            >
              👤 {friend.username}
            </div>
          ))}
          {filteredGroups.length === 0 && filteredFriends.length === 0 && (
            <div className="no-result">No match found</div>
          )}
        </div>
      )}

      <div className="group-chats">
        <div className="group-head-box">
          <h2>Groups</h2>
          <button onClick={openModal}>
            <i className="ri-chat-new-line"></i>
          </button>
        </div>
        {groups.map((item) => (
          <div
            className="chat-container"
            key={item._id}
            onClick={() => handleGroupClick(item)}
          >
            <div className="chat-show">
              <div className="chat-show-img">
                <img
                  src={
                    item.image ||
                    "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                  }
                  alt="group"
                />
              </div>
              <div className="user-container">
                <div className="user-sms">
                  <h4>{item.groupname}</h4>
                  <p>{item.isOnline ? "Online" : "Offline"}</p>
                </div>
                <div className="last-seen">
                  <small>{formatTime(item.lastSeen)}</small>
                </div>
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>

      <div className="single-chats">
        <h2>People</h2>
        {friends.map((item) => (
          <div
            className="chat-container"
            key={item._id}
            onClick={() => handleClick(item)}
          >
            <div className="chat-show">
              <div className="chat-show-img">
                <img
                  src={
                    item.image ||
                    "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                  }
                  alt="user"
                />
              </div>
              <div className="user-container">
                <div className="user-sms">
                  <h4>{item.username}</h4>
                  <p>{item.isOnline ? "Online" : "Offline"}</p>
                </div>
                {
                  item.isOnline && (<div className="last-seen">
                  <small>{formatTime(item.lastSeen)}</small>
                </div>)
                }
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onGroupCreated={fetchGroups}
      />
    </div>
  );
};

export default ChatRooms;
