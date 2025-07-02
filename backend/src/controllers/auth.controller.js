import { upsertStreamUser } from "../lib/stream.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!(fullName && email && password)) {
      return res.status(400).send("All fields are required");
    }

    if (password.length < 6) {
      return res
        .status(400)
        .send("Password must be at least 6 characters long");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const index = Math.floor(Math.random() * 100 + 1);
    const profilePicture = `https://avatar.iran.liara.run/public/${index}.png`;

    const user = await User.create({
      fullName,
      email,
      password,
      profilePicture,
    });

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
      return res.status(400).send("All fields are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User does not exist");
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(400).send("Invalid credentials");
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

export { signUp, login, logout };
