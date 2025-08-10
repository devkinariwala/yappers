import { json } from "express";
import { upsertStreamUser } from "../lib/stream.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!(fullName && email && password)) {
      return res.status(400).json("All fields are required");
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // const index = Math.floor(Math.random() * 100 + 1);

    const user = await User.create({
      fullName,
      email,
      password,
      profilePicture,
    });
    const profilePicture = `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.fullName}.png`;
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePicture,
      });
      console.log(`Stream user created for ${user.fullName} successfully`);
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      return res.status(500).json({ message: "Failed to create Stream user" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const options = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    };

    res.cookie("token", token, options);
    res.status(201).json({ user, token, message: "User created successfully" });
  } catch (error) {
    console.error("Error occurred during sign up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const options = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    };

    res.cookie("token", token, options);
    res.status(200).json({ user, token, message: "Login successful" });
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout successful" });
};

const onBoard = async (req, res) => {
  try {
    const userId = req.user._id;

    const { fullName, bio, location } = req.body;

    if (!(fullName && bio && location))
      return res.status(400).json({ message: "All fields required." });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        location,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found." });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePicture,
      });
    } catch (error) {
      console.log("Error while updating user in stream: ", error);
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error occurred during onboarding:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { signUp, login, logout, onBoard };
