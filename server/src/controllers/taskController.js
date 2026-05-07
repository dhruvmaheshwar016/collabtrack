import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function ensureObjectId(id, label) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error(`${label} is invalid`);
    error.statusCode = 400;
    throw error;
  }
}

async function getAccessibleProject(projectId, user) {
  ensureObjectId(projectId, 'Project id');
  const project = await Project.findById(projectId);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const isCreator = project.createdBy.equals(user._id);
  const isMember = project.members.some((memberId) => memberId.equals(user._id));

  if (!isCreator && !isMember) {
    const error = new Error('You do not have access to this project');
    error.statusCode = 403;
    throw error;
  }

  return project;
}

function buildTaskQuery(req) {
  const query = {};
  const { projectId, status, search } = req.query;

  if (projectId) {
    ensureObjectId(projectId, 'Project id');
    query.projectId = projectId;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$text = { $search: search };
  }

  return query;
}

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, projectId, deadline } = req.body;
  ensureObjectId(assignedTo, 'Assigned user id');
  const project = await getAccessibleProject(projectId, req.user);

  if (!project.createdBy.equals(req.user._id)) {
    const error = new Error('Only the project creator can create tasks');
    error.statusCode = 403;
    throw error;
  }

  if (!project.members.some((memberId) => memberId.equals(assignedTo))) {
    const error = new Error('Assigned user must be a project member');
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.create({
    title,
    description,
    assignedTo,
    projectId,
    deadline
  });

  await task.populate('assignedTo projectId', 'name email role name description');
  res.status(201).json({ task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const query = buildTaskQuery(req);

  if (query.projectId) {
    await getAccessibleProject(query.projectId, req.user);
  } else {
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    }).select('_id');
    query.projectId = { $in: projects.map((project) => project._id) };
  }

  if (req.user.role === 'Member') {
    query.assignedTo = req.user._id;
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email role')
    .populate('projectId', 'name description')
    .sort({ deadline: 1, createdAt: -1 });

  res.json({ tasks });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  ensureObjectId(id, 'Task id');

  const task = await Task.findById(id);

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const project = await getAccessibleProject(task.projectId, req.user);
  const isAssignedMember = task.assignedTo.equals(req.user._id);
  const isProjectCreator = project.createdBy.equals(req.user._id);

  if (req.user.role === 'Member' && !isAssignedMember) {
    const error = new Error('Members can update only tasks assigned to them');
    error.statusCode = 403;
    throw error;
  }

  if (req.user.role === 'Admin' && !isProjectCreator && !isAssignedMember) {
    const error = new Error('Admins can update only tasks in their projects');
    error.statusCode = 403;
    throw error;
  }

  task.status = status;
  await task.save();
  await task.populate('assignedTo', 'name email role');
  await task.populate('projectId', 'name description');

  res.json({ task });
});

export const dashboardSummary = asyncHandler(async (req, res) => {
  const projectQuery = {
    $or: [{ createdBy: req.user._id }, { members: req.user._id }]
  };
  const projects = await Project.find(projectQuery).select('_id');
  const query = { projectId: { $in: projects.map((project) => project._id) } };

  if (req.user.role === 'Member') {
    query.assignedTo = req.user._id;
  }

  const now = new Date();
  const [totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
    Task.countDocuments(query),
    Task.countDocuments({ ...query, status: 'Completed' }),
    Task.countDocuments({ ...query, status: { $ne: 'Completed' } }),
    Task.countDocuments({ ...query, status: { $ne: 'Completed' }, deadline: { $lt: now } })
  ]);

  res.json({ totalTasks, completedTasks, pendingTasks, overdueTasks });
});
