const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listProjects,
  listMyProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  expressInterest
} = require('../controllers/projectController');

const router = express.Router();

router.get('/', listProjects);
router.get('/mine', requireAuth, requireRole('ngo'), listMyProjects);
router.get('/:id', getProject);
router.post('/', requireAuth, requireRole('ngo'), createProject);
router.put('/:id', requireAuth, requireRole('ngo'), updateProject);
router.delete('/:id', requireAuth, requireRole('ngo'), deleteProject);
router.post('/:id/interest', requireAuth, requireRole('partner'), expressInterest);

module.exports = router;
