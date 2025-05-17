import ChatGroup from "../models/group.model.js";
import Message from "../models/message.model.js";
import { io } from "../server.js";

// Save a new message in DB (for one-to-one or group chat)
export const messageSaveInDB = async (req, res) => {
  try {
    const { receiverId, groupId, messageType, content } = req.body;
    const senderId = req.user || req.user._id || req.user.id;

    // Validate: Either receiverId or groupId must be present, not both
    if ((!receiverId && !groupId) || (receiverId && groupId)) {
      return res.status(400).json({
        message: "Either Receiver Id or Group Id is required",
      });
    }

    // Group validation
    if (groupId) {
      const groupExist = await ChatGroup.findById(groupId);
      if (!groupExist) {
        return res.status(404).json({ message: "Group does not exist" });
      }
      if (!groupExist.members.includes(senderId)) {
        return res.status(403).json({ message: "You are not in this group" });
      }
    }

    // Create new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId || null,
      group: groupId || null,
      messageType: messageType || "text",
      content: content,
      status: "unread",
      timestamp: new Date(),
    });
    await newMessage.save();

    // ✅ Optional: emit new message to client using Socket.io
    // io.emit("new-message", newMessage); // optional - depends on frontend logic

    res.status(201).json({ message: "Message sent successfully.", newMessage });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fetch messages for one-to-one or group chat
export const messageShow = async (req, res) => {
  try {
    const { receiverId, groupId } = req.query;
    const senderId = req.user;

    // Validate input
    if ((!receiverId && !groupId) || (receiverId && groupId)) {
      return res.status(400).json({
        message: "Either receiver or group must be provided.",
      });
    }

    let message;

    if (receiverId) {
      // Fetch one-to-one messages
      message = await Message.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).sort({ createdAt: -1 });

      // Mark messages as read
      await Message.updateMany(
        { sender: receiverId, receiver: senderId, status: "unread" },
        { $set: { status: "read" } }
      );
    }

    if (groupId) {
      const group = await ChatGroup.findById(groupId);
      if (!group) {
        return res.status(404).json("Group does not exist");
      }
      if (!group.members.includes(senderId)) {
        return res.status(403).json("You are not in this group");
      }

      // Fetch group messages (latest 10)
      message = await Message.find({ group: groupId })
        .sort({ createdAt: -1 })
        .limit(10);

      // Mark messages as read
      await Message.updateMany(
        { group: groupId, status: "unread" },
        { $set: { status: "read" } }
      );
    }

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Edit a specific message by sender
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newContent } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Authorization check
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "You can only edit your messages" });
    }

    // Update message
    message.content = newContent;
    message.isEdited = true;
    await message.save();

    // Notify client via socket
    io.to(message.receiver.toString()).emit("message-edited", {
      messageId,
      newContent,
    });

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete message for everyone
export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user || req.user._id || req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "You can only delete your messages" });
    }

    // Soft delete
    message.content = "This message was deleted";
    message.isDeleted = true;
    await message.save();

    // Notify frontend
    io.to(message.receiver.toString()).emit("message-deleted", { messageId });

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete chat history between two users
export const deleteChatHistory = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user || req.user._id || req.user.id;

  try {
    // Find messages exchanged between both users
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (messages.length === 0) {
      return res.status(404).json({ message: "No chat history found." });
    }

    // Update `deletedByUsers` array
    const updatedMessages = await Promise.all(
      messages.map(async (message) => {
        if (!message.deletedByUsers.includes(senderId)) {
          message.deletedByUsers.push(senderId);
        }

        // If both users deleted this message, remove it from DB
        if (
          message.deletedByUsers.includes(senderId) &&
          message.deletedByUsers.includes(receiverId)
        ) {
          message.isCompletelyDeleted = true;
          await message.save();
          await Message.deleteOne({ _id: message._id });
        } else {
          await message.save(); // Save soft deletion
        }

        return message;
      })
    );

    res.status(200).json({
      message:
        "Chat history update successful. If both users agree, messages will be deleted.",
      data: updatedMessages,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
