// ✅ SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUserContext } from "./UserContext"; // ✅ Import

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);
  const { setOnlineUsers, setLastSeenMap } = useUserContext(); // ✅ Access user context

  useEffect(() => {
    if (userId) {
      const newSocket = io("https://bro-code-cuxb.onrender.com/", {
        transports: ["websocket"],
        query: { userId },
      });

      console.log("🔌 Connecting socket...");

      newSocket.on("connect", () => {
        console.log("✅ Socket connected: ", newSocket.id);
      });

      // ✅ Listen for online users list
      newSocket.on("online-users-list", (userList) => {
        console.log("📡 Online users updated:", userList);
        setOnlineUsers(userList); // ✅ Store in context
      });

      newSocket.on("user-last-seen", ({ userId, lastSeen }) => {
        setLastSeenMap((prev) => ({
          ...prev,
          [userId]: lastSeen,
        }));
      });

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

