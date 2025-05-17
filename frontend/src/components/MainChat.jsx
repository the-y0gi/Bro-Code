import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useUserContext } from "../context/UserContext";
import { useSocket } from "../context/SocketContext";
import { format } from "timeago.js";
import axios from "../config/axios";
import GroupInfoModal from "./GroupInfoModal ";
import axiosInstance from "../config/axios";
import AttachFileModal from "./AttachFile";
import CameraModal from "./CameraModal";
import MediaMessage from "./MediaMessage";
import { sendMediaMessage } from "../utilities/sendMediaMessage";
import NoChatSelected from "./NoChatSelected";
import "../pages/css/Footer.css"
const MainChat = ({
  selectedChat,
  currentUser,
  setSelectedChat,
  setGroupsShouldRefresh,
}) => {
  const socket = useSocket();

  // States for chat
  const [showCameraModal, setShowCameraModal] = useState(false);

  const [showAttachModal, setShowAttachModal] = useState(false);
  const [currentFileType, setCurrentFileType] = useState("");
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messageEndRef = useRef(null); // for auto-scrolling to bottom

  const { onlineUsers, lastSeenMap } = useUserContext();
  const isOnline = onlineUsers.includes(selectedChat?.id);
  const lastSeen = lastSeenMap[selectedChat?.id];

  const menuRef = useRef(null);
  // Function to handle chat history deletion
  const handleDeleteChatHistory = () => {
    if (!selectedChat?.id || !currentUser?.user?._id) return;

    // Emit delete request to the server
    socket.emit("delete-chat-history", {
      senderId: currentUser.user._id,
      receiverId: selectedChat.id,
    });

    setShowDeletePopup(true);

    toast.info("Chat history deletion request sent");
  };

  // Function to confirm deletion (accept the request)
  const confirmDeletion = () => {
    socket.emit("confirm-chat-history-deletion", {
      senderId: currentUser.user._id,
      receiverId: selectedChat.id,
    });

    setShowDeletePopup(false);
    toast.info("Chat history deleted");
  };

  // Function to reject deletion (close the popup)
  const rejectDeletion = () => {
    socket.emit("reject-chat-history-deletion", {
      senderId: currentUser.user._id,
      receiverId: selectedChat.id,
    });

    setShowDeletePopup(false);
  };

  // 👉 Start editing a message
  const handleEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditContent(msg.content);
  };

  // 👉 Confirm edited message and send update to server
  const confirmEdit = () => {
    if (!editContent.trim()) return;

    socket.emit("edit-message", {
      messageId: editingMessageId,
      newText: editContent,
    });

    setEditingMessageId(null);
    setEditContent("");
  };

  // 📜 Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔁 Fetch old messages when chat is selected
  const fetchPreviousMessages = async () => {
    try {
      if (!selectedChat?.id) return;

      let res;
      if (selectedChat.status === "Group Chat") {
        res = await axios.get(
          `/message/message-show?groupId=${selectedChat.id}`
        );
      } else {
        res = await axios.get(
          `/message/message-show?receiverId=${selectedChat.id}`
        );
      }

      setMessages(res.data.message.reverse()); // show latest messages at the bottom
    } catch (error) {
      console.error("❌ Error fetching messages:", error.message);
    }
  };

  // 🗑️ Delete a message (double click)
  const handleDelete = async (messageId) => {
    try {
      socket.emit("delete-message", { messageId });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("❌ Error deleting message:", error.message);
    }
  };

  // ✍️ Emit typing event
  let typingTimeout;
  const handleTyping = () => {
    if (!socket || !selectedChat?.id || !currentUser?.user?._id) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        senderId: currentUser.user._id,
        receiverId: selectedChat.id,
      });
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop-typing", {
        senderId: currentUser.user._id,
        receiverId: selectedChat.id,
      });
      setIsTyping(false);
    }, 1000);
  };

  // Listen for a delete chat history request from the other user
  useEffect(() => {
    if (!socket) return;

    const handleDeleteRequest = ({ senderId, receiverId }) => {
      if (receiverId === currentUser.user._id) {
        // Show delete confirmation popup to the current user
        setShowDeletePopup(true);
      }
    };

    socket.on("delete-chat-history-request", handleDeleteRequest);

    return () => {
      socket.off("delete-chat-history-request", handleDeleteRequest);
    };
  }, [socket, currentUser?.user?._id]);

  // 📝 Listen for edited message from server
  useEffect(() => {
    if (!socket) return;

    const handleEdited = ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, content: newText, isEdited: true }
            : msg
        )
      );
      toast.info("Message edited");
    };

    socket.on("message-updated", handleEdited);

    return () => {
      socket.off("message-updated", handleEdited);
    };
  }, [socket]);

  // ❌ Listen for message delete from server
  useEffect(() => {
    if (!socket) return;

    const handleDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      toast.error("Message deleted");
    };

    socket.on("message-deleted", handleDeleted);

    return () => {
      socket.off("message-deleted", handleDeleted);
    };
  }, [socket]);

  // 👀 Handle typing indicators (listen from server)
  useEffect(() => {
    if (!socket) return;

    const handleTypingEvent = ({ senderId }) => {
      if (senderId === selectedChat?.id) {
        setTypingUsers((prev) => [...new Set([...prev, senderId])]);
      }
    };


    const handleStopTypingEvent = ({ senderId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== senderId));
    };

    socket.on("typing", handleTypingEvent);
    socket.on("stop-typing", handleStopTypingEvent);

    return () => {
      socket.off("typing", handleTypingEvent);
      socket.off("stop-typing", handleStopTypingEvent);
    };
  }, [socket, selectedChat?.id]);

  // 📥 Fetch messages when chat changes
  useEffect(() => {
    setMessages([]);
    fetchPreviousMessages();
  }, [selectedChat?.id]);

  // 🔌 Join room and listen for incoming messages

  useEffect(() => {
    if (!socket || !currentUser?.user?._id || !selectedChat?.id) return;

    const userId = currentUser.user._id;
    socket.emit("user-online", userId); // 🔁 Notify user is online
    socket.emit("join-room", selectedChat.id); // 🔁 Join the current chat room
  }, [socket, selectedChat?.id, currentUser?.user?._id]); // ✅ Keep as it was

  useEffect(() => {
    if (!socket || !currentUser?.user?._id) return;

    const userId = currentUser.user._id;

    const handleReceiveMessage = (msg) => {
      const isGroupMessage = msg?.group;
      const isDirectMessage = msg?.receiver && msg?.sender;

      const isCurrentChat =
        (isDirectMessage &&
          ((msg?.sender === selectedChat?.id && msg?.receiver === userId) ||
            (msg?.sender === userId && msg?.receiver === selectedChat?.id))) ||
        (isGroupMessage && msg?.group === selectedChat?.id);

      // Ensure the message is not a duplicate
      if (isCurrentChat && !messages.some((m) => m._id === msg._id)) {
        setMessages((prev) => [...prev, msg]);

        const shouldMarkAsSeen =
          (isDirectMessage &&
            msg?.receiver === userId &&
            msg?.sender !== userId) ||
          (isGroupMessage &&
            msg?.group === selectedChat?.id &&
            msg?.sender !== userId);

        if (shouldMarkAsSeen) {
          socket.emit("mark-as-seen", {
            messageId: msg._id,
            userId,
          });
        }
      }
    };

    socket.off("receive-message"); // ✅ Clear old listener before adding
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, selectedChat?.id, currentUser?.user?._id, messages]); // Add messages to the dependency array

  useEffect(() => {
    scrollToBottom(); // scroll every time message updates
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    };

    socket.on("message-status", handleStatusUpdate);

    return () => {
      socket.off("message-status", handleStatusUpdate);
    };
  }, [socket]);

  // 📤 Send a new message

  const sendMessage = () => {
    if (!message.trim()) return;
    if (!socket || !selectedChat?.id) return;

    const isGroup = selectedChat?.status === "Group Chat";

    const msgData = {
      senderId: currentUser.user._id,
      content: message,
      messageType: "text",
      ...(isGroup
        ? { groupId: selectedChat.id }
        : { receiverId: selectedChat.id }),
    };

    socket.emit("send-message", msgData);
    setMessage(""); // clear input
  };

  const handleRemoveMember = async (userIdToRemove) => {
    try {
      if (!selectedChat?.id) {
        return;
      }

      if (userIdToRemove === "delete-group") {
        // ✅ Delete whole group
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this group?"
        );
        if (!confirmDelete) return;

        await axiosInstance.delete(`/groups/delete-group/${selectedChat?.id}`);


        // Optionally redirect or update UI
        setSelectedChat(null); // Clear current cha
      } else {
        // ✅ Normal remove member
        await axiosInstance.delete(
          `/groups/remove-member/${selectedChat?.id}/${userIdToRemove}`
        );

        // Update UI
        setSelectedChat((prev) => ({
          ...prev,
          members: prev.members.filter(
            (member) => member._id !== userIdToRemove
          ),
        }));
      }
    } catch (error) {
      console.error(
        "Failed to perform action:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleAddMember = (newUser) => {
    setSelectedChat((prevChat) => ({
      ...prevChat,
      members: [...prevChat.members, newUser],
    }));
  };

  const handleUserExitGroup = (exitedGroupId) => {
    setChats((prevChats) =>
      prevChats.filter((chat) => chat._id !== exitedGroupId)
    );
    setSelectedChat(null);
  };

  const toggleAttachMenu = () => {
    setShowAttachModal(false);
    setShowAttachMenu((prev) => !prev);
  };
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowAttachMenu(false); // 👈 Close menu
    }
  };

  useEffect(() => {
    if (showAttachMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachMenu]);


  const handlePhotoVideo = (type) => {

    setCurrentFileType(type); // 'photo' or 'video'
    setShowAttachMenu(false);
    setShowAttachModal(true);
    // Photo/Video select karne ka input trigger karwa sakte hain
  };
  const handleCameraClick = () => {
    setShowCameraModal(true);
  };

  const handleCapturePhoto = async (capturedImageData) => {
  try {
    // Upload the captured image (Base64 or Blob) to Cloudinary or your backend
    const formData = new FormData();
    formData.append("file", capturedImageData);
    formData.append("upload_preset", "your_upload_preset"); // replace with your Cloudinary preset
    formData.append("cloud_name", "your_cloud_name"); // replace with your Cloudinary cloud name

    const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.secure_url) {
      const secureUrl = data.secure_url;

      socket.emit("send-message", {
        senderId: currentUser?.user._id,
        receiverId: selectedChat?.id,
        groupId:
          selectedChat?.status === "Group Chat" ? selectedChat?.id : null,
        content: secureUrl,
        messageType: "image",
      });
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Failed to send captured photo:", error);
    toast.error("Failed to send captured photo.");
  }
};


  const handleDocument = () => {
    console.log("Document selected");
    setCurrentFileType("document");
    setShowAttachMenu(false);
    setShowAttachModal(true);
  };

  const handleFileSelect = async (file) => {
    try {
      // file already uploaded to cloudinary
  

      const secureUrl = file.url;
      const messageType = file.type.startsWith("image") ? "image" : "document";


      // send via socket
      socket.emit("send-message", {
        senderId: currentUser?.user._id,
        receiverId: selectedChat?.id,
        groupId:
          selectedChat?.status === "Group Chat" ? selectedChat?.id : null,
        content:secureUrl,
        messageType
      });


      
    } catch (error) {
      console.error("Failed to send media message:", error);
      toast.error("Failed to send media message.");
    }
  };



  
  if (!selectedChat) {
    return <NoChatSelected />;
  }
  

  return (
    <div className="main-chat-container" >
      {/* Chat Header */}
      <div className="chat-header-container">
        <div className="chat-header">
          <div className="main-chat-img">
            <img
              src= { selectedChat?.image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
              alt="user"
            />
          </div>
          <div className="main-chat-user">
            <h4>{selectedChat?.name || "Select a Chat"}</h4>
            <p>
              {typingUsers.includes(selectedChat?.id)
                ? "typing..."
                : isOnline
                ? "online"
                : lastSeen
                ? `Last seen: ${format(lastSeen)}`
                : "offline"}
            </p>
          </div>
          <div className="header-side-box">
            {selectedChat?.status == "Group Chat" && (
              <div
                className="group-info-icon"
                onClick={() => setShowGroupInfo(true)}
              >
                <i className="ri-information-line"></i>
              </div>
            )}

            {showGroupInfo && (
              <GroupInfoModal
                groupMembers={selectedChat?.members}
                currentAdminId={selectedChat?.admin}
                currentUserId={currentUser?.user}
                selectedChatId={selectedChat?.id}
                onClose={() => setShowGroupInfo(false)}
                onRemoveMember={handleRemoveMember}
                onAddMember={handleAddMember}
                onExitGroup={handleUserExitGroup}
                setGroupsShouldRefresh={setGroupsShouldRefresh}
              />
            )}

            <div onClick={handleDeleteChatHistory}>
              <i className="ri-delete-bin-7-fill"></i>
            </div>
          </div>
        </div>
        <hr />
      </div>

      {/* Chat Messages */}
      <div className="send-receive-box">
        {messages.map((msg, index) => {
          const isSender =
            (msg.senderId || msg.sender) === currentUser.user._id;

          // STATUS DOT LOGIC
          let statusColor = "";
          if (msg.status === "seen") statusColor = "#9DC08B";
          else if (msg.status === "delivered") statusColor = "#1F509A";
          else if (!isOnline) statusColor = "#a54834";

          return (
            <div
              key={index}
              className={`${
                (msg.senderId || msg.sender) === currentUser.user._id
                  ? "receive-message"
                  : "send-message"
              } ${msg.isEdited ? "edited-tag" : ""}`}
              onDoubleClick={() => handleDelete(msg._id)} // double click to delete
              onContextMenu={(e) => {
                e.preventDefault();
                if ((msg.senderId || msg.sender) === currentUser.user._id) {
                  handleEdit(msg); // right click to edit
                }
              }}
              style={{ position: "relative" }} // for positioning the dot
            >
              {/* Status Dot only for sent messages */}
              {isSender && (
                <span
                  className="message-status-dot"
                  style={{
                    backgroundColor: statusColor,
                  }}
                />
              )}

              {/* Message Content / Edit Input */}
              {editingMessageId === msg._id ? (
                <input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit();
                  }}
                  onBlur={confirmEdit}
                  autoFocus
                />
              ) : (
                <>
                  {msg.messageType !== "text" ? (
                    <MediaMessage message={msg} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </>
              )}
            </div>
          );
        })}

        <div ref={messageEndRef} />
      </div>
      {showDeletePopup && (
        <div className="delete-popup-overlay">
          <div className="delete-popup">
            <p>Are you sure you want to delete the chat history?</p>
            <button onClick={confirmDeletion}>Yes</button>
            <button onClick={rejectDeletion}>No</button>
          </div>
        </div>
      )}

      {/* Footer Input */}
      <div className="footer-container">
        <div className="typing-box-container">
          <div className="file-attach">
            <i className="ri-attachment-2" onClick={toggleAttachMenu}></i>

            {showAttachMenu && (
              <div className="attach-menu">
                <div
                  className="attach-item"
                  onClick={() => handlePhotoVideo("photo")}
                >
                  <i className="ri-image-line"></i> Photos
                </div>
                <div
                  className="attach-item"
                  onClick={() => handlePhotoVideo("video")}
                >
                  <i className="ri-image-line"></i> Videos
                </div>
                <div className="attach-item" onClick={handleDocument}>
                  <i className="ri-file-3-line"></i> Documents
                </div>
              </div>
            )}
          </div>

          <div className="text-input">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message here..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <i className="ri-send-plane-fill" onClick={sendMessage}></i>
          </div>
        </div>
        <div className="camera-icon" onClick={handleCameraClick}>
          <i className="ri-camera-fill"></i>
        </div>
        {/* Attach Modal */}
        {showAttachModal && (
          <AttachFileModal
            onClose={() => setShowAttachModal(false)}
            onFileSelect={handleFileSelect}
            fileType={currentFileType}
            currentUser={currentUser}
            selectedUserId={selectedChat}
          />
        )}
        {showCameraModal && (
          <CameraModal
            onClose={() => setShowCameraModal(false)}
            onCapture={handleCapturePhoto}
          />
        )}
      </div>
    </div>
  );
};

export default MainChat;
