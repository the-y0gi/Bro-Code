import Message from "../models/message.model.js";

export const uploadController = async (req, res) => {
  try {
    const fileUrl = req.file.path; // Cloudinary URL
    const fileType = req.file.mimetype;

    res.json({
      success: true,
      url: fileUrl,
      type: fileType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

export const createMediaMessage = async (req, res) => {
  try {
    const { senderId, receiverId, groupId, url, messageType } = req.body;

    // Fix: Updated condition to check if either receiver or group is provided
    if (!senderId || !url || !messageType || !(receiverId || groupId)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create the message in the database
    const newMessage = await Message.create({
      sender : senderId,
      receiver: receiverId || null, // If no receiver, assign null
      group: groupId || null, // If no group, assign null
      content: url, // URL of the media
      messageType, // Type of message (image, video, file)
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: "Media message saved",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error saving media message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
