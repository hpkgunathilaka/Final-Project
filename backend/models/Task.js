const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 140 },
    description: { type: String, default: '', trim: true, maxlength: 4000 },
    status: { type: String, enum: ['todo', 'in_progress', 'completed'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dueDate: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
