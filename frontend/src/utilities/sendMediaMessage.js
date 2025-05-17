

import axiosInstance from "../config/axios";

export const sendMediaMessage = async ({
  senderId,
  receiverId,
  groupId,
  url,
  messageType,
}) => {
  try {
    // Making the POST request to send the media message
    const response = await axiosInstance.post("/media/media-file", {
      senderId,
      receiverId: receiverId || null, // If no receiverId, set to null
      groupId: groupId || null,         // If no groupId, set to null
      url,                     // Media URL
      messageType,                      // Type of media (image, video, etc.)
    });

    return response.data; // Return the response data if successful
  } catch (error) {
    console.error("Error sending media message:", error); // Log error for debugging
    throw error; // Rethrow the error for handling further upstream
  }
};
