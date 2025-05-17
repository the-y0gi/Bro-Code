import User from "../models/user.models.js";
import FriendRequest from "../models/friendRequest.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user;

    // 1. Get all users except the logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("username email image bio");

    const usersWithRequestStatus = [];

    for (const user of users) {
      // 2. Check if request exists
      const existingRequest = await FriendRequest.findOne({
        $or: [
          { sender: loggedInUserId, receiver: user._id },
          { sender: user._id, receiver: loggedInUserId },
        ],
      });

      // 3. Exclude users with accepted request
      if (existingRequest && existingRequest.status === "accepted") {
        continue; // skip this user
      }

      usersWithRequestStatus.push({
        ...user.toObject(),
        requestStatus: existingRequest ? existingRequest.status : "not_sent",
      });
    }

    res.status(200).json(usersWithRequestStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

