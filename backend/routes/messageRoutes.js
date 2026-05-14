const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/projectAccess');
const { sendMessage, listThread } = require('../controllers/messageController');

const router = express.Router();

// One-to-one messaging between NGO and Tech Partner within a project
router.post('/projects/:projectId/messages', requireAuth, requireProjectMember, sendMessage);
router.get('/projects/:projectId/messages/with/:userId', requireAuth, requireProjectMember, listThread);

module.exports = router;
