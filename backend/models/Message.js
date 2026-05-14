const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 4000 },
    readBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
