import { Router } from "express";
import { signUp, login, logout } from "../controllers/auth.controller.js";

const router = Router();

router.route("/signup").post(signUp);

router.route("/login").post(login);

router.route("/logout").post(logout);

export default router;
