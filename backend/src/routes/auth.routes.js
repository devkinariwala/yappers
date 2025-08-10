import { Router } from "express";
import {
  signUp,
  login,
  logout,
  onBoard,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(signUp);

router.route("/login").post(login);

router.route("/logout").post(logout);

router.route("/onboarding").post(protectRoute, onBoard);

router.route("/me").get(protectRoute, (req, res) => {
  return res
    .status(200)
    .json({ user: req.user, message: "User is logged in", success: true });
});

export default router;
