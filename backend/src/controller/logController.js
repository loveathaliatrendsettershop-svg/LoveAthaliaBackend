import UserLog from "../models/logReport.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

// ==========================
// Login Attempt Tracker (in-memory)
// ==========================
const loginAttempts = {};

const MAX_ATTEMPTS   = 5;
const BLOCK_DURATION = 1 * 60 * 1000; // 1 minute

function isBlocked(email) {
  const record = loginAttempts[email];
  if (!record) return false;
  if (record.blockedUntil && Date.now() < record.blockedUntil) return true;
  return false;
}

function getTimeLeft(email) {
  const record = loginAttempts[email];
  if (!record || !record.blockedUntil) return 0;
  const left = Math.ceil((record.blockedUntil - Date.now()) / 1000);
  return left > 0 ? left : 0;
}

function recordFailedAttempt(email) {
  if (!loginAttempts[email]) {
    loginAttempts[email] = { count: 0, blockedUntil: null };
  }
  if (loginAttempts[email].blockedUntil && Date.now() >= loginAttempts[email].blockedUntil) {
    loginAttempts[email] = { count: 0, blockedUntil: null };
  }
  loginAttempts[email].count += 1;
  if (loginAttempts[email].count >= MAX_ATTEMPTS) {
    loginAttempts[email].blockedUntil = Date.now() + BLOCK_DURATION;
    loginAttempts[email].count = 0;
  }
}

function resetAttempts(email) {
  delete loginAttempts[email];
}

// ==========================
// Time In (Login)
// ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // ✅ Check if blocked
    if (isBlocked(email)) {
      const secondsLeft = getTimeLeft(email);
      return res.status(429).json({
        message: `Too many failed attempts. Please wait ${secondsLeft} second(s) before trying again.`,
        secondsLeft,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      recordFailedAttempt(email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedAttempt(email);
      const record       = loginAttempts[email];
      const attemptsLeft = MAX_ATTEMPTS - (record?.count || 0);

      if (isBlocked(email)) {
        return res.status(429).json({
          message: `Too many failed attempts. Please wait 60 seconds before trying again.`,
          secondsLeft: 60,
        });
      }

      return res.status(400).json({
        message: `Invalid email or password. ${attemptsLeft} attempt(s) remaining before lockout.`,
      });
    }

    // ✅ Success — reset attempts
    resetAttempts(email);

    const log = await UserLog.create({ user: user._id, timeIn: new Date() });

    user.lastActive = new Date();
    await user.save();

    res.status(200).json({
      message: "Time In recorded", log, user: {
        _id:        user._id,
        first_name: user.first_name,
        last_name:  user.last_name,
        email:      user.email,
        image:      user.image,
        role:       user.role,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Time Out (Logout)
// ==========================
export const logoutUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const log = await UserLog.findOne({ user: user._id, timeOut: null }).sort({ createdAt: -1 });
    if (!log)
      return res.status(400).json({ message: "No active session found" });

    log.timeOut = new Date();
    await log.save();

    user.lastActive = new Date();
    await user.save();

    res.status(200).json({ message: "Time Out recorded", log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get all logs
// ==========================
export const getAllLogs = async (req, res) => {
  try {
    const logs = await UserLog.find()
      .populate("user", "first_name last_name email role lastActive")
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get logs by user
// ==========================
export const getLogsByUser = async (req, res) => {
  try {
    const logs = await UserLog.find({ user: req.params.userId })
      .populate("user", "first_name last_name email role lastActive")
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get logs by date range
// ==========================
export const getLogsByDate = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end)
      return res.status(400).json({ message: "Start and end dates required" });

    const startDate = new Date(start);
    const endDate   = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const logs = await UserLog.find({
      timeIn: { $gte: startDate, $lte: endDate }
    }).populate("user", "first_name last_name email role lastActive");

    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Check if user is active (timed in)
// ==========================
export const checkUserStatus = async (req, res) => {
  try {
    const log = await UserLog.findOne({ user: req.params.userId, timeOut: null });
    res.status(200).json({ active: !!log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};