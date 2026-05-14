const User = require('../models/User');
const Project = require('../models/Project');

async function listUsers(req, res, next) {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email role isBlocked blockedAt blockedReason lastLoginAt createdAt updatedAt');
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role')
      .select('title status timeline skillsNeeded createdBy createdAt updatedAt');
    return res.json({ projects });
  } catch (err) {
    return next(err);
  }
}

async function setUserBlocked(req, res, next) {
  try {
    const { blocked, reason } = req.body || {};
    if (typeof blocked !== 'boolean') {
      return res.status(400).json({ message: 'blocked must be boolean' });
    }

    if (String(req.params.userId) === String(req.user.sub)) {
      return res.status(400).json({ message: 'You cannot block/unblock your own account' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be blocked via this endpoint' });
    }

    user.isBlocked = blocked;
    user.blockedAt = blocked ? new Date() : null;
    user.blockedReason = blocked ? (typeof reason === 'string' ? reason.trim().slice(0, 200) : '') : '';
    await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        blockedAt: user.blockedAt,
        blockedReason: user.blockedReason,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (String(req.params.userId) === String(req.user.sub)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be deleted via this endpoint' });
    }

    await user.deleteOne();
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return next(err);
  }
}

async function deleteInactiveUsers(req, res, next) {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days || '90', 10), 1), 3650);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Inactive = lastLoginAt < cutoff OR never logged in and createdAt < cutoff
    const filter = {
      role: { $ne: 'admin' },
      $or: [{ lastLoginAt: { $lt: cutoff } }, { lastLoginAt: null, createdAt: { $lt: cutoff } }]
    };

    const result = await User.deleteMany(filter);
    return res.json({ deletedCount: result.deletedCount || 0, cutoff });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listUsers,
  listProjects,
  setUserBlocked,
  deleteUser,
  deleteInactiveUsers
};
