const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyLogoUrl: String,
  location: String,
  field: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  approvalStatus: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  requiredSkills: [String],
  duration: String,
  deadline: Date,
  website: String,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminNotes: String,
  approvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
// new
