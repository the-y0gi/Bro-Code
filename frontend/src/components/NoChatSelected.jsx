import React from "react";
import "../pages/css/NoChatSelected.css"; // Create this CSS file for styling
import pic from "../assets/pic 2.png"
const NoChatSelected = () => {
  return (
    <div className="no-chat-selected">
      <img
        src={pic} // Make sure this file exists in `public/`
        alt="No Chat Selected"
        className="no-chat-image"
      />
      <h2>Select a chat to start messaging</h2>
      <p>Your conversations will show up here once you start chatting.</p>
    </div>
  );
};

export default NoChatSelected;
