// ✅ UserContext.jsx
import React, { createContext, useContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeenMap, setLastSeenMap] = useState({});

  return (
    <UserContext.Provider
      value={{
        data,
        setData,
        onlineUsers,
        setOnlineUsers,
        lastSeenMap,
        setLastSeenMap,
       
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
