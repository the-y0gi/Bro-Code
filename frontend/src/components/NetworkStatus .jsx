

import React, { useEffect, useState } from "react";
import { MdWifiOff, MdWifi } from "react-icons/md"; // npm install react-icons
import "../pages/css/NetworkStatus.css"; 

const NetworkStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnectMessage, setShowReconnectMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectMessage(true);
      setTimeout(() => setShowReconnectMessage(false), 3000); // Auto-hide after 3s
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectMessage(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="network-banner offline">
        <MdWifiOff size={20} /> No Internet Connection
      </div>
    );
  }

  if (showReconnectMessage && isOnline) {
    return (
      <div className="network-banner online">
        <MdWifi size={20} /> You are back online
      </div>
    );
  }

  return null;
};

export default NetworkStatusBanner;
