import User from "../models/user.js";
import nodemailer from "nodemailer";

// Store PINs temporarily (in production use Redis or DB)
const pinStore = {};
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
// ==========================
// Send PIN to email
// ==========================
export const sendPin = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email not found" });

    // Generate 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // Save PIN with 10 minute expiry
    pinStore[email] = {
      pin,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ✅
        pass: process.env.EMAIL_PASS, // ✅
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset PIN",
      text: `Your PIN is: ${pin}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "PIN sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Verify PIN
// ==========================
export const verifyPin = async (req, res) => {
  try {
    const { email, pin } = req.body;

    const record = pinStore[email];
    if (!record)
      return res.status(400).json({ message: "No PIN found for this email" });

    if (Date.now() > record.expiresAt)
      return res.status(400).json({ message: "PIN has expired" });

    if (record.pin !== pin)
      return res.status(400).json({ message: "Incorrect PIN" });

    res.status(200).json({ message: "PIN verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Reset Password
// ==========================
export const resetPassword = async (req, res) => {
  try {
    const { email, pin, newPassword } = req.body;

    const record = pinStore[email];
    if (!record || record.pin !== pin)
      return res.status(400).json({ message: "Invalid or expired PIN" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    // ==========================
    // PASSWORD VALIDATION ADDED
    // ==========================
    if (!newPassword || !passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, include 1 uppercase letter and 1 number"
      });
    }

    // Hash new password
    const bcrypt = await import("bcryptjs");
    const hashed = await bcrypt.default.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Clear PIN after use
    delete pinStore[email];

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};