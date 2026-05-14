const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listUsers,
  listProjects,
  setUserBlocked,
  deleteUser,
  deleteInactiveUsers
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', listUsers);
router.delete('/users/inactive', deleteInactiveUsers);
router.patch('/users/:userId/block', setUserBlocked);
router.delete('/users/:userId', deleteUser);

router.get('/projects', listProjects);

module.exports = router;
