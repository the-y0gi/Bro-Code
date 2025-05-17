import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupname: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image:{
      type:String
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const ChatGroup = mongoose.model("ChatGroup", groupSchema);
export default ChatGroup;
