import FriendRequest from "../models/friendRequest.model.js";


// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Create a new friend request
    const newRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(201).json({
      message: "Friend request sent",
      request: newRequest,
    });
  } catch (error) {
    console.log("send request :", error.message); // Debugging console
    res.status(500).json({ error: error.message });
  }
};

// Cancel a friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    // Find and delete the friend request
    const deletedRequest = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
    });

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      message: "Friend request cancelled successfully",
      request: deletedRequest,
    });
  } catch (error) {
    console.log("cancel request :", error.message); // Debugging console
    res.status(500).json({ error: error.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    // Update request status to accepted
    request.status = "accepted";
    await request.save();

    res.status(200).json({
      message: "Friend request accepted",
      request,
    });
  } catch (error) {
    console.log("accept request :", error.message); // Debugging console
    res.status(500).json({ error: error.message });
  }
};

// Get all incoming pending friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user;

    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "username email");

    res.status(200).json({ requests });
  } catch (error) {
    console.log("get requests :", error.message); // Debugging console
    res.status(500).json({ error: error.message });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    // Update status to rejected
    request.status = "rejected";
    await request.save();

    res.status(200).json({
      message: "Friend request rejected",
      request,
    });
  } catch (error) {
    console.log("reject request :", error.message); // Debugging console
    res.status(500).json({ error: error.message });
  }
};
