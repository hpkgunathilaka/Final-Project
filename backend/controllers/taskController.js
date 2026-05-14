const Task = require('../models/Task');
const User = require('../models/User');

function normalizeStatus(input) {
  if (typeof input !== 'string') return null;
  const v = input.trim().toLowerCase();
  if (v === 'todo' || v === 'to do' || v === 'to-do') return 'todo';
  if (v === 'in_progress' || v === 'in progress' || v === 'in-progress') return 'in_progress';
  if (v === 'completed' || v === 'complete' || v === 'done') return 'completed';
  return null;
}

async function listTasks(req, res, next) {
  try {
    const tasks = await Task.find({ project: req.project._id })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');
    return res.json({ tasks });
  } catch (err) {
    return next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, dueDate, priority } = req.body || {};
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    if (!trimmedTitle) {
      return res.status(400).json({ message: 'title is required' });
    }

    const task = await Task.create({
      project: req.project._id,
      title: trimmedTitle,
      description: typeof description === 'string' ? description.trim() : '',
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.user.sub
    });

    return res.status(201).json({ task });
  } catch (err) {
    return next(err);
  }
}

async function assignTask(req, res, next) {
  try {
    const { assignedTo } = req.body || {};
    if (!assignedTo) {
      return res.status(400).json({ message: 'assignedTo is required' });
    }

    const task = await Task.findOne({ _id: req.params.taskId, project: req.project._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const user = await User.findById(assignedTo).select('role');
    if (!user || user.role !== 'partner') {
      return res.status(400).json({ message: 'assignedTo must be a Tech Partner user' });
    }

    // Must be a collaborator (member) to be assigned.
    const isCollaborator = (req.project.collaborators || []).some((id) => String(id) === String(assignedTo));
    if (!isCollaborator) {
      return res.status(400).json({ message: 'User must be a project collaborator to be assigned tasks' });
    }

    task.assignedTo = assignedTo;
    await task.save();
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    const normalized = normalizeStatus(status);
    if (!normalized) {
      return res.status(400).json({ message: 'Invalid status. Use: To Do, In Progress, Completed' });
    }

    const task = await Task.findOne({ _id: req.params.taskId, project: req.project._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isOwner = String(req.project.createdBy) === String(req.user.sub);
    const isAssignee = task.assignedTo && String(task.assignedTo) === String(req.user.sub);
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner && !isAssignee) {
      return res.status(403).json({ message: 'Only the project owner or assigned partner can update task status' });
    }

    task.status = normalized;
    await task.save();
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listTasks,
  createTask,
  assignTask,
  updateTaskStatus
};
