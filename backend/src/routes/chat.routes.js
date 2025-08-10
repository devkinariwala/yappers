import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";
const router = express.Router();
router.route("/token").get(protectRoute, getStreamToken);
export default router;
