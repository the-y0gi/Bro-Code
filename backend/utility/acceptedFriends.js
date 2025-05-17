import FriendRequest from "../models/friendRequest.model.js";

export const acceptedFriendsData = async (userId) => {
  // console.log(userId,"userID");

  const acceptedList = await FriendRequest.find({
    $or: [{ sender: userId }, { receiver: userId }],
    status: "accepted",
  });
  // console.log(acceptedList , "accepted list name ");

  const extractedIDs = acceptedList.map((request) =>
      request.sender.toString() === userId
      ? request.receiver.toString()
      : request.sender.toString()
  );

  // console.log(extractedIDs , "ids list name ")

  return extractedIDs;
};
