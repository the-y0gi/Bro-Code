import React from "react";

const MediaMessage = ({ message }) => {

  const renderMedia = () => {
    switch (message?.messageType) {
      case "image":
        return (
          <div className="media-message-container">
            <img src={message.content} alt="media" className="media-image" />
          </div>
        );
      case "video":
        return (
          <div className="media-message-container">
            <div className="video-container">
              <video
                src={message.content}
                controls
                width="100%"
                className="media-video"
              />
            </div>
          </div>
        );
      case "file":
        return (
          <div className="media-message-container">
            <div className="file-preview">
              <i className="ri-file-3-line"></i>
              <p>
                {typeof message.content === "string"
                  ? message.content.split("/").pop()
                  : "Unknown File"}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="message-container">{message && renderMedia()}</div>;
};

export default MediaMessage;
