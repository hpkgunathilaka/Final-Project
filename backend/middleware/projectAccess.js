const Project = require('../models/Project');

function isProjectMember(project, user) {
  if (!project || !user) return false;
  if (user.role === 'admin') return true;
  const userId = String(user.sub);
  if (String(project.createdBy) === userId) return true;
  const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
  return collaborators.some((id) => String(id) === userId);
}

async function requireProjectMember(req, res, next) {
  try {
    const projectId = req.params.projectId || req.params.id;
    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }

    const project = await Project.findById(projectId).select('createdBy collaborators title');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectMember(project, req.user)) {
      return res.status(403).json({ message: 'Only project members can access this resource' });
    }

    req.project = project;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireProjectOwnerOrAdmin(req, res, next) {
  if (req.user.role === 'admin') return next();
  if (req.project && String(req.project.createdBy) === String(req.user.sub)) return next();
  return res.status(403).json({ message: 'Only the project owner can perform this action' });
}

module.exports = { requireProjectMember, requireProjectOwnerOrAdmin, isProjectMember };
