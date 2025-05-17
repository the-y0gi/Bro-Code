import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatGroup",
      default: null,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    deletedByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
 
    // Flag to mark whether both users have agreed to delete the chat
    isCompletelyDeleted: {
      type: Boolean,
      default: false,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Messages", messageSchema);
export default Message;
