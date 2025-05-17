import FriendRequest from "../models/friendRequest.model.js";
import ChatGroup from "../models/group.model.js";
import User from "../models/user.models.js";
import { acceptedFriendsData } from "../utility/acceptedFriends.js";

export const groupCreated = async (req, res) => {
  try {
    let { groupname, member } = req.body;
    const adminId = req.user;

    if (typeof member === "string") {
      member = JSON.parse(member);
    }

    const imageUrl = req.file?.path || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";

    const groupnameExisted = await ChatGroup.findOne({ groupname });
    if (groupnameExisted) {
      return res.status(400).json({ message: "This group name already exists" });
    }

    const friendIDs = await acceptedFriendsData(adminId);
    const validMembers = member.filter((id) => friendIDs.map(String).includes(String(id)));

    const newGroup = await ChatGroup.create({
      groupname,
      admin: adminId,
      image: imageUrl,
      members: [adminId, ...validMembers],
    });

    res.status(201).json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    console.error("groupCreated error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const groupMemberShow = async (req, res) => {
  try {
    const userId = req.user;
    const groups = await ChatGroup.find({
      $or: [{ members: userId }, { admin: userId }],
    })
      .populate("members", "username email")
      .populate("admin", "username email");

    res.status(200).json({ groups });
  } catch (error) {
    console.error("groupMemberShow error:", error);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

export const groupAdminAddMember = async (req, res) => {
  try {
    const { groupID } = req.params;
    const { members } = req.body;
    const adminId = req.user;

    const group = await ChatGroup.findById(groupID);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    const acceptedFriends = await FriendRequest.find({
      $or: [{ sender: adminId }, { receiver: adminId }],
      status: "accepted",
    });

    const friendIds = acceptedFriends.map((fr) =>
      fr.sender.toString() === adminId ? fr.receiver.toString() : fr.sender.toString()
    );

    const validMembers = members.filter((memberId) => friendIds.includes(memberId));
    const newMembers = validMembers.filter(
      (memberId) => !group.members.map(String).includes(memberId)
    );

    if (newMembers.length === 0) {
      return res.status(400).json({ message: "No valid members to add" });
    }

    group.members.push(...newMembers);
    await group.save();

    res.status(200).json({ message: "Members added successfully", group });
  } catch (error) {
    console.error("groupAdminAddMember error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const groupAdminRemoveMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const adminId = req.user;

    const group = await ChatGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    if (!group.members.map(String).includes(userId)) {
      return res.status(400).json({ message: "User is not a member of this group" });
    }

    group.members = group.members.filter((member) => member.toString() !== userId);

    if (userId === adminId) {
      if (group.members.length === 0) {
        await ChatGroup.findByIdAndDelete(groupId);
        return res.status(200).json({ message: "Group deleted as admin left" });
      } else {
        group.admin = group.members[0];
      }
    }

    await group.save();
    res.status(200).json({ message: "Member removed successfully", group });
  } catch (error) {
    console.error("groupAdminRemoveMember error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const groupDeletedByAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const adminId = req.user;

    const group = await ChatGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ message: "Only admin can delete the group" });
    }

    await ChatGroup.findByIdAndDelete(groupId);
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("groupDeletedByAdmin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const groupExistByUser = async (req, res) => {
  try {
    const { groupID } = req.body;
    const userID = req.user;

    const group = await ChatGroup.findById(groupID);
    if (!group) {
      return res.status(404).json({ message: "Group does not exist" });
    }

    if (!group.members.map(String).includes(userID)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    group.members = group.members.filter((member) => member.toString() !== userID);
    await group.save();

    if (group.members.length === 0) {
      await ChatGroup.findByIdAndDelete(groupID);
      return res.status(200).json({
        message: "You exited the group. Group deleted as no members left.",
      });
    }

    res.status(200).json({ message: "You have exited the group" });
  } catch (error) {
    console.error("groupExistByUser error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
