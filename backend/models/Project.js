const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skillsNeeded: { type: [String], default: [] },
    timeline: { type: String, default: '', trim: true, maxlength: 200 },
    budget: { type: String, default: '' },
    location: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'archived'],
      default: 'open'
    },
    collaborators: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    interests: [
      {
        partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
