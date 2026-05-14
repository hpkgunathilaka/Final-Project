const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getProjectMatches } = require('../controllers/matchingController');

const router = express.Router();

// Returns ranked tech partners for a given project
router.get('/projects/:id/matches', requireAuth, requireRole('ngo', 'admin'), getProjectMatches);

module.exports = router;
