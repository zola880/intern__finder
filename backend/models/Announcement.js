const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  fullName: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  
  // AI verification results
  aiVerdict: { type: String, enum: ['valid', 'suspicious', 'invalid'], default: null },
  aiConfidence: { type: Number, min: 0, max: 100, default: null },
  aiNotes: { type: String, default: '' },
  
  // Financial and document fields
  bankAccountEncrypted: { type: String, required: true },
  acceptanceLetterUrl: { type: String, required: true },
  studentIdPhotoUrl: { type: String, default: '' },
  
  // Workflow status
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'STIPEND_SENT', 'REJECTED'],
    default: 'PENDING'
  },
  processedAt: Date,
  adminNotes: String,
  
  // Audit trail
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);