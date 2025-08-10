import { friendRequestModel } from "../models/friendRequest.model.js";
import { User } from "../models/user.model.js";

const getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    });
    return res.status(200).json(recommendedUsers);
  } catch (error) {
    console.log("Error in recommendedUser controller: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePicture");
    return res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getMyFriends controller: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: recipientId } = req.params;
    if (!recipientId || recipientId === "undefined") {
      return res.status(400).json({ message: "Recipient ID is required." });
    }
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot send request to yourself." });
    }
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found." });
    }
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }
    const existingRequest = await friendRequestModel.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent." });
    }
    const friendRequest = await friendRequestModel.create({
      sender: myId,
      recipient: recipientId,
    });
    return res.status(201).json(friendRequest);
  } catch (error) {
    console.log("Error in sending friend request: ", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
const acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await friendRequestModel.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are unauthorized to accept this request." });
    }
    friendRequest.status = "accepted";
    await friendRequest.save();
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });
    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in accepting friend req:", error);
  }
};
const getFriendRequests = async (req, res) => {
  try {
    const incomingRequest = await friendRequestModel
      .find({
        recipient: req.user.id,
        status: "pending",
      })
      .populate("sender", "fullName profilePicture");
    const acceptedRequest = await friendRequestModel
      .find({
        sender: req.user.id,
        status: "accepted",
      })
      .populate("recipient", "fullName profilePicture");
    return res.status(200).json({ incomingRequest, acceptedRequest });
  } catch (error) {
    console.log(
      "Error in retrieving incoming and accepted friend request: ",
      error
    );
    res.status(500).json({ message: "Internal Server Error." });
  }
};
const getOutgoingFriendRequest = async (req, res) => {
  try {
    const outgoingRequest = await friendRequestModel
      .find({
        sender: req.user.id,
        status: "pending",
      })
      .populate("recipient", "fullName profilePicture");
    return res.status(200).json(outgoingRequest);
  } catch (error) {
    console.log("Error in getOutgoingFriendRequest controller: ", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
export {
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendRequest,
};
