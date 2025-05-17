
import User from "../models/user.models.js";
import { acceptedFriendsData } from "../utility/acceptedFriends.js";

export const acceptedFriends = async (req , res) => {
    try {
        const userId = req.user;
        const extractedIDs = await acceptedFriendsData(userId);
        const Ids = extractedIDs.toString();
        
        //$in---> jo jo extractedIDs me h find all ids
        const friendDetails = await User.find({ _id : {$in : extractedIDs}} , {username: 1 , email: 1, isOnline: 1, lastSeen:1, image:1, bio:1 });

         res.status(200).json({friendDetails});

    } catch (error) {
        console.log("Error Fetching friends list: " ,error);
        res.status(500).json({error: "Internal server error"});        
    }
        
}