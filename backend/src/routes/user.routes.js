import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendRequest,
  getRecommendedUsers,
  sendFriendRequest,
} from "../controllers/user.controller.js";
const router = express.Router();

router.use(protectRoute);
router.route("/").get(getRecommendedUsers);
router.route("/friends").get(getMyFriends);
router.route("/friend-request/:id").post(sendFriendRequest);
router.route("/friend-request/:id/accept").put(acceptFriendRequest);
router.route("/friend-requests").get(getFriendRequests);
router.route("/outgoing-friend-requests").get(getOutgoingFriendRequest);

export default router;
