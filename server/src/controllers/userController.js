import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('name email role').sort({ name: 1 });
  res.json({ users });
});
