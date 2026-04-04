const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true }
}, { timestamps: true });

// Compound unique index to prevent duplicates
savedSchema.index({ user: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('SavedInternship', savedSchema);
// new
