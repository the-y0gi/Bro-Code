import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoDBConnected from "./db/db.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Message from "./models/message.model.js";
import User from "./models/user.models.js";
import ChatGroup from "./models/group.model.js";
import path from "path";
import express from "express"
// Connect to MongoDB
mongoDBConnected();

// Setup CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server with CORS config
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const _dirname = path.resolve();

// Map to store online users: userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  // When user comes online
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online-users-list", Array.from(onlineUsers.keys()));
  });

  // Typing indicator events
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stop-typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stop-typing", { senderId });
    }
  });

  // Send message event
  socket.on("send-message", async (data) => {
    try {
      const { senderId, receiverId, groupId, content, messageType } = data;

      if (!senderId || (!receiverId && !groupId) || !content) {
        return io.to(socket.id).emit("error", { message: "Invalid data." });
      }

      // Create new message document
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId || null,
        group: groupId || null,
        content,
        status: "sent",
        messageType,
      });

      // Emit to sender immediately for real-time UI update
      io.to(socket.id).emit("receive-message", newMessage);

      // Save message in DB
      await newMessage.save();

      if (groupId) {
        // Emit to all group members except sender
        const group = await ChatGroup.findById(groupId).populate("members", "_id");
        group.members.forEach((member) => {
          if (member._id.toString() !== senderId) {
            const memberSocketId = onlineUsers.get(member._id.toString());
            if (memberSocketId) {
              io.to(memberSocketId).emit("receive-message", newMessage);
            }
          }
        });
      } else {
        // Emit to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          newMessage.status = "delivered";
          await newMessage.save();
          io.to(receiverSocketId).emit("receive-message", newMessage);
        }
      }

      // Send message status update to sender
      io.to(socket.id).emit("message-status", {
        messageId: newMessage._id,
        status: newMessage.status,
      });
    } catch (error) {
      console.error("Error while sending message:", error.message);
    }
  });

  // Mark message as seen
  socket.on("mark-as-seen", async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId).populate("group");

      if (!message) return;

      if (message.group) {
        if (!message.seenBy.includes(userId)) {
          message.seenBy.push(userId);
          await message.save();

          const group = message.group;
          const allSeen = group.members.every((member) =>
            message.seenBy.includes(member.toString())
          );

          if (allSeen && message.status !== "seen") {
            message.status = "seen";
            await message.save();
            io.emit("message-status", { messageId, status: "seen" });
          }
        }
      } else {
        // 1-to-1 message
        if (message.receiver.toString() === userId) {
          message.status = "seen";
          await message.save();
          io.emit("message-status", { messageId, status: "seen" });
        }
      }
    } catch (error) {
      console.log("❌ Seen logic error", error.message);
    }
  });

  // Edit message content
  socket.on("edit-message", async ({ messageId, newText }) => {
    if (!newText || !newText.trim()) return; // Prevent empty content

    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      message.content = newText.trim();
      message.isEdited = true;

      await message.save();

      io.emit("message-updated", { messageId, newText: message.content });
    } catch (error) {
      console.error("❌ Error editing message:", error.message);
    }
  });

  // Delete a single message
  socket.on("delete-message", async ({ messageId }) => {
    const message = await Message.findById(messageId);
    if (message) {
      await Message.deleteOne({ _id: messageId });
      io.emit("message-deleted", { messageId });
    }
  });

  // Request chat history deletion
  socket.on("delete-chat-history", async ({ senderId, receiverId }) => {
    try {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("chat-history-delete-request", {
          senderId,
          receiverId,
        });

        io.to(socket.id).emit("chat-history-delete-sent", {
          message: `Request sent to ${receiverId} for chat history deletion.`,
        });
      } else {
        io.to(socket.id).emit("error", {
          message: "Receiver is offline. Please try again later.",
        });
      }
    } catch (error) {
      console.error(
        "❌ Error during chat history deletion request:",
        error.message
      );
    }
  });

  // Confirm chat history deletion
  socket.on(
    "confirm-chat-history-deletion",
    async ({ senderId, receiverId }) => {
      try {
        const messages = await Message.find({
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
          ],
        });

        await Promise.all(
          messages.map(async (message) => {
            await Message.deleteOne({ _id: message._id });

            io.to(senderId).emit("chat-history-deleted", {
              message: "Chat history has been deleted.",
            });
            io.to(receiverId).emit("chat-history-deleted", {
              message: "Chat history has been deleted.",
            });
          })
        );
      } catch (error) {
        console.error(
          "❌ Error confirming chat history deletion:",
          error.message
        );
      }
    }
  );

  // Reject chat history deletion request
  socket.on("reject-chat-history-deletion", ({ senderId, receiverId }) => {
    try {
      io.to(senderId).emit("chat-history-deletion-rejected", {
        message: `${receiverId} rejected your chat history deletion request.`,
      });
    } catch (error) {
      console.error("❌ Error rejecting chat history deletion:", error.message);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", async () => {
    let disconnectedUser = null;

    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUser = userId;
        break;
      }
    }

    if (disconnectedUser) {
      onlineUsers.delete(disconnectedUser);

      // Update user's last seen in DB
      await User.findByIdAndUpdate(disconnectedUser, { lastSeen: new Date() });

      io.emit("online-users-list", Array.from(onlineUsers.keys()));
      io.emit("user-last-seen", {
        userId: disconnectedUser,
        lastSeen: new Date(),
      });
    }
  });
});

app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get('*', (_,res) => {
  res.sendFile(path.resolve(_dirname ,"frontend" , "dist", "index.html"))
})

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
