const Project = require('../models/Project');

function normalizeSkills(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s) => typeof s === 'string')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function isOwner(project, userId) {
  return project.createdBy && project.createdBy.toString() === String(userId);
}

async function listProjects(req, res, next) {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');
    return res.json({ projects });
  } catch (err) {
    return next(err);
  }
}

async function listMyProjects(req, res, next) {
  try {
    const projects = await Project.find({ createdBy: req.user.sub })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');
    return res.json({ projects });
  } catch (err) {
    return next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('interests.partner', 'name email role');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.json({ project });
  } catch (err) {
    return next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const {
      title,
      description,
      skillsNeeded,
      requiredSkills,
      timeline,
      status,
      budget,
      location
    } = req.body;

    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';

    if (!trimmedTitle || !trimmedDescription) {
      return res.status(400).json({ message: 'title and description are required' });
    }

    const normalizedSkills = normalizeSkills(skillsNeeded || requiredSkills);

    const allowedStatus = ['open', 'in_progress', 'completed', 'archived'];
    const safeStatus = allowedStatus.includes(status) ? status : 'open';

    const project = await Project.create({
      title: trimmedTitle,
      description: trimmedDescription,
      skillsNeeded: normalizedSkills,
      timeline: typeof timeline === 'string' ? timeline.trim() : '',
      status: safeStatus,
      budget: budget || '',
      location: location || '',
      createdBy: req.user.sub
    });

    return res.status(201).json({ project });
  } catch (err) {
    return next(err);
  }
}

async function expressInterest(req, res, next) {
  try {
    const { message } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const already = project.interests.some((i) => i.partner.toString() === req.user.sub);
    if (already) {
      return res.status(409).json({ message: 'You have already expressed interest in this project' });
    }

    project.interests.push({ partner: req.user.sub, message: message || '' });
    await project.save();
    return res.status(201).json({ message: 'Interest recorded' });
  } catch (err) {
    return next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the NGO who created the project can edit it
    if (!isOwner(project, req.user.sub)) {
      return res.status(403).json({ message: 'You can only edit your own projects' });
    }

    const {
      title,
      description,
      skillsNeeded,
      requiredSkills,
      timeline,
      status
    } = req.body || {};

    if (title !== undefined) {
      const t = typeof title === 'string' ? title.trim() : '';
      if (!t) return res.status(400).json({ message: 'title cannot be empty' });
      project.title = t;
    }

    if (description !== undefined) {
      const d = typeof description === 'string' ? description.trim() : '';
      if (!d) return res.status(400).json({ message: 'description cannot be empty' });
      project.description = d;
    }

    if (skillsNeeded !== undefined || requiredSkills !== undefined) {
      project.skillsNeeded = normalizeSkills(skillsNeeded || requiredSkills);
    }

    if (timeline !== undefined) {
      project.timeline = typeof timeline === 'string' ? timeline.trim() : '';
    }

    if (status !== undefined) {
      const allowedStatus = ['open', 'in_progress', 'completed', 'archived'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      project.status = status;
    }

    await project.save();
    return res.json({ project });
  } catch (err) {
    return next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the NGO who created the project can delete it
    if (!isOwner(project, req.user.sub)) {
      return res.status(403).json({ message: 'You can only delete your own projects' });
    }

    await project.deleteOne();
    return res.json({ message: 'Project deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listProjects,
  listMyProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  expressInterest
};
