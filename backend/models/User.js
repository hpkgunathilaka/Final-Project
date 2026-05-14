const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ngo', 'partner', 'admin'], required: true },
    organizationName: { type: String, default: '', trim: true },
    skills: { type: [String], default: [] },
    ngoProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'NGOProfile', default: null },
    techPartnerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'TechPartnerProfile', default: null },
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null },
    blockedReason: { type: String, default: '', trim: true, maxlength: 200 },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
