const Project = require('../models/Project');
const User = require('../models/User');

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .filter((s) => typeof s === 'string')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function intersection(a, b) {
  const setB = new Set(b);
  return Array.from(new Set(a.filter((x) => setB.has(x))));
}

async function getProjectMatches(req, res, next) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);

    const project = await Project.findById(req.params.id).select('skillsNeeded createdBy title');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // NGO/admin can request matches, but NGOs should only see matches for their own projects.
    if (req.user.role === 'ngo' && project.createdBy.toString() !== req.user.sub) {
      return res.status(403).json({ message: 'You can only view matches for your own projects' });
    }

    const required = normalizeSkills(project.skillsNeeded);
    if (required.length === 0) {
      return res.json({
        project: { id: project._id, title: project.title },
        requiredSkills: [],
        matches: []
      });
    }

    // Simple matching: partners ranked by number of overlapping skills.
    const partners = await User.find({ role: 'partner' })
      .select('name email role skills techPartnerProfile')
      .lean();

    const ranked = partners
      .map((p) => {
        const partnerSkills = normalizeSkills(p.skills);
        const matched = intersection(required, partnerSkills);
        return {
          partner: {
            id: p._id,
            name: p.name,
            email: p.email,
            role: p.role
          },
          score: matched.length,
          matchedSkills: matched
        };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return res.json({
      project: { id: project._id, title: project.title },
      requiredSkills: required,
      matches: ranked
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProjectMatches };
