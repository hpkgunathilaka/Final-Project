const Message = require('../models/Message');
const User = require('../models/User');

function isAllowedPair(aRole, bRole) {
  const a = String(aRole);
  const b = String(bRole);
  return (a === 'ngo' && b === 'partner') || (a === 'partner' && b === 'ngo');
}

async function sendMessage(req, res, next) {
  try {
    const { recipientId, content } = req.body || {};
    const trimmedContent = typeof content === 'string' ? content.trim() : '';

    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }
    if (!trimmedContent) {
      return res.status(400).json({ message: 'content is required' });
    }

    // Recipient must exist
    const recipient = await User.findById(recipientId).select('role');
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Restrict to NGO <-> Partner only (admin excluded from 1:1 messaging)
    if (!isAllowedPair(req.user.role, recipient.role)) {
      return res.status(400).json({ message: 'Messages must be between an NGO and a Tech Partner' });
    }

    // Recipient must be a project member as well
    const isRecipientMember =
      String(req.project.createdBy) === String(recipientId) ||
      (req.project.collaborators || []).some((id) => String(id) === String(recipientId));

    if (!isRecipientMember) {
      return res.status(403).json({ message: 'Recipient must be a member of this project' });
    }

    const message = await Message.create({
      project: req.project._id,
      sender: req.user.sub,
      recipient: recipientId,
      content: trimmedContent
    });

    return res.status(201).json({ message });
  } catch (err) {
    return next(err);
  }
}

async function listThread(req, res, next) {
  try {
    const otherUserId = req.params.userId;
    if (!otherUserId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Ensure the other user is a project member
    const isOtherMember =
      String(req.project.createdBy) === String(otherUserId) ||
      (req.project.collaborators || []).some((id) => String(id) === String(otherUserId));

    if (!isOtherMember) {
      return res.status(403).json({ message: 'Other user must be a member of this project' });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);

    const messages = await Message.find({
      project: req.project._id,
      $or: [
        { sender: req.user.sub, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user.sub }
      ]
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role');

    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
}

module.exports = { sendMessage, listThread };
