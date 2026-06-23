const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ApcUser } = require("../models");

const DEFAULT_PASSWORD = "admin123";

module.exports = {
  apcList: async (req, res) => {
    const apcs = await ApcUser.findAll();
    res.json({ apcs });
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });
    const user = await ApcUser.findByEmail(email.toLowerCase().trim());
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: "Invalid email or password" });
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  },

  me: async (req, res) => {
    const user = await ApcUser.findById(req.apc.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  },

  resetPassword: async (req, res) => {
    const { apcId } = req.body;
    if (!apcId) return res.status(400).json({ error: "apcId required" });
    const user = await ApcUser.findById(apcId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    await ApcUser.updatePassword(apcId, hash);
    res.json({ message: "Password reset to default successfully" });
  },

  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both fields required" });
    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    const user = await ApcUser.findByEmail(req.apc.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match)
      return res.status(401).json({ error: "Current password is incorrect" });
    const hash = await bcrypt.hash(newPassword, 12);
    await ApcUser.updatePassword(req.apc.id, hash);
    res.json({ message: "Password changed successfully" });
  },
};
