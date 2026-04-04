const mongoose = require('mongoose');

const adminApplicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  universityName: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  adminNotes: String,
}, { timestamps: true });

module.exports = mongoose.model('AdminApplication', adminApplicationSchema);