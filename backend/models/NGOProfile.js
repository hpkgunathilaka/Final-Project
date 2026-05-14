const mongoose = require('mongoose');

const NGOProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    website: { type: String, default: '', trim: true, maxlength: 200 },
    country: { type: String, default: '', trim: true, maxlength: 80 },
    address: { type: String, default: '', trim: true, maxlength: 200 },
    mission: { type: String, default: '', trim: true, maxlength: 1000 },
    contactEmail: { type: String, default: '', lowercase: true, trim: true, maxlength: 254 },
    contactPhone: { type: String, default: '', trim: true, maxlength: 40 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('NGOProfile', NGOProfileSchema);
