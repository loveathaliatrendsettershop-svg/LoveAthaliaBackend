import User from "../models/user.js";
import bcrypt from "bcryptjs";

// ==========================
// PASSWORD RULE (GLOBAL)
// ==========================
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// ==========================
// CREATE USER
// ==========================
export const createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, image } = req.body;

    // required fields
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    if (!first_name)
      return res.status(400).json({ message: "First name is required" });

    if (!last_name)
      return res.status(400).json({ message: "Last name is required" });

    // check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // password validation
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ characters, include 1 uppercase letter and 1 number"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
      image
    });

    const { password: _, ...userData } = user.toObject();

    res.status(201).json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// GET ALL USERS
// ==========================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// GET SINGLE USER
// ==========================
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// UPDATE USER
// ==========================
export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };

    // ==========================
    // PASSWORD UPDATE (FIXED)
    // ==========================
    if (updates.password !== undefined) {
      const password = updates.password;

      if (!password || password.trim() === "") {
        return res.status(400).json({
          message: "Password cannot be empty"
        });
      }

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message:
            "Password must be 8+ characters, include 1 uppercase letter and 1 number"
        });
      }

      updates.password = await bcrypt.hash(password, 10);
    }

    // auto update last active
    updates.lastActive = Date.now();

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// DELETE USER
// ==========================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};