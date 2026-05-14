const mongoose = require('mongoose');

const TechPartnerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, default: '', trim: true, maxlength: 120 },
    website: { type: String, default: '', trim: true, maxlength: 200 },
    bio: { type: String, default: '', trim: true, maxlength: 1000 },
    skills: { type: [String], default: [], validate: [(v) => v.length <= 50, 'Too many skills'] },
    availability: {
      type: String,
      enum: ['unknown', 'part_time', 'full_time', 'volunteer'],
      default: 'unknown'
    },
    contactEmail: { type: String, default: '', lowercase: true, trim: true, maxlength: 254 },
    contactPhone: { type: String, default: '', trim: true, maxlength: 40 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TechPartnerProfile', TechPartnerProfileSchema);
