import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function ensureObjectId(id, label) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error(`${label} is invalid`);
    error.statusCode = 400;
    throw error;
  }
}

export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
    members: [req.user._id]
  });

  await project.populate('createdBy members', 'name email role');
  res.status(201).json({ project });
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ createdBy: req.user._id }, { members: req.user._id }]
  })
    .populate('createdBy members', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ projects });
});

export const addMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  ensureObjectId(id, 'Project id');
  ensureObjectId(userId, 'User id');

  const [project, user] = await Promise.all([Project.findById(id), User.findById(userId)]);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (!project.createdBy.equals(req.user._id)) {
    const error = new Error('Only the project creator can add members');
    error.statusCode = 403;
    throw error;
  }

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!project.members.some((memberId) => memberId.equals(user._id))) {
    project.members.push(user._id);
    await project.save();
  }

  await project.populate('createdBy members', 'name email role');
  res.json({ project });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  ensureObjectId(id, 'Project id');
  ensureObjectId(userId, 'User id');

  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (!project.createdBy.equals(req.user._id)) {
    const error = new Error('Only the project creator can remove members');
    error.statusCode = 403;
    throw error;
  }

  if (project.createdBy.equals(userId)) {
    const error = new Error('Project creator cannot be removed');
    error.statusCode = 400;
    throw error;
  }

  project.members = project.members.filter((memberId) => !memberId.equals(userId));
  await project.save();
  await Task.updateMany({ projectId: project._id, assignedTo: userId }, { status: 'Pending' });
  await project.populate('createdBy members', 'name email role');

  res.json({ project });
});
