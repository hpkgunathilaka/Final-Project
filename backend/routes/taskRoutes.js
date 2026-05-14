const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireProjectMember, requireProjectOwnerOrAdmin } = require('../middleware/projectAccess');
const {
  listTasks,
  createTask,
  assignTask,
  updateTaskStatus
} = require('../controllers/taskController');

const router = express.Router();

router.get('/projects/:projectId/tasks', requireAuth, requireProjectMember, listTasks);

// Create tasks under a project (project owner/admin only)
router.post('/projects/:projectId/tasks', requireAuth, requireProjectMember, requireProjectOwnerOrAdmin, createTask);

// Assign tasks to tech partners (project owner/admin only)
router.patch(
  '/projects/:projectId/tasks/:taskId/assign',
  requireAuth,
  requireProjectMember,
  requireProjectOwnerOrAdmin,
  assignTask
);

// Update task status (project owner/admin or assignee)
router.patch('/projects/:projectId/tasks/:taskId/status', requireAuth, requireProjectMember, updateTaskStatus);

module.exports = router;
