const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['STUDENT', 'EMPLOYER', 'UNIVERSITY_ADMIN', 'ADMIN'],
    default: 'STUDENT'
  },
  fullName: { type: String, required: true },
  department: String,
  university: String,
  year: { type: String, enum: ['1','2','3','4','5'] },
  experienceLevel: { type: String, enum: ['Beginner','Intermediate','Advanced'], default: 'Beginner' },
  goal: String,
  interests: [String],
  location: String,
  bankAccount: String,
  refreshToken: String,          // store refresh token (optional but convenient)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
// new
