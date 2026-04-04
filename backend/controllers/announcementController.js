const Announcement = require('../models/Announcement');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { encrypt, decrypt } = require('../services/encryptionService');
const { uploadToCloudinary } = require('../services/fileUploadService');
const { verifyDocuments } = require('../services/aiVerificationService'); // AI decision service

// Helper: extract text from file (stub – replace with real OCR)
async function extractTextFromFile(fileBuffer, mimeType) {
  // In production: call OCR API (e.g., Tesseract, Google Vision)
  // For now, return a dummy text based on filename
  return "Simulated extracted text from the document.";
}

// Student submits an announcement (with two optional files)
exports.createAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only students can announce internships' });
    }

    const { internshipId, fullName, department, year, bankAccount } = req.body;
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    if (!bankAccount || !/^\d{10,16}$/.test(bankAccount)) {
      return res.status(400).json({ message: 'Valid bank account number required (10-16 digits)' });
    }

    // --- Upload files and extract text for AI ---
    let acceptanceLetterUrl = '', studentIdPhotoUrl = '';
    let acceptanceText = '', studentIdText = '';

    if (req.files && req.files.acceptanceLetter) {
      const file = req.files.acceptanceLetter[0];
      acceptanceLetterUrl = await uploadToCloudinary(file.buffer, file.originalname);
      acceptanceText = await extractTextFromFile(file.buffer, file.mimetype);
    } else {
      return res.status(400).json({ message: 'Acceptance letter is required' });
    }

    if (req.files && req.files.studentIdPhoto) {
      const file = req.files.studentIdPhoto[0];
      studentIdPhotoUrl = await uploadToCloudinary(file.buffer, file.originalname);
      studentIdText = await extractTextFromFile(file.buffer, file.mimetype);
    }

    // --- AI verification ---
    const aiResult = await verifyDocuments(acceptanceText, studentIdText, req.user, internship);

    // Determine initial status based on AI verdict
    let status = 'PENDING';
    let adminNotes = '';
    if (aiResult.verdict === 'invalid') {
      status = 'REJECTED';
      adminNotes = `AI automatically rejected: ${aiResult.notes} (confidence ${aiResult.confidence}%)`;
    } else if (aiResult.verdict === 'suspicious') {
      status = 'PENDING';
      adminNotes = `AI flagged as suspicious: ${aiResult.notes}. Manual review required.`;
    } else {
      status = 'PENDING';
      adminNotes = `AI verified: ${aiResult.notes} (confidence ${aiResult.confidence}%)`;
    }

    const encryptedBank = encrypt(bankAccount);

    const announcement = await Announcement.create({
      student: req.user._id,
      internship: internshipId,
      fullName,
      department,
      year,
      bankAccountEncrypted: encryptedBank,
      acceptanceLetterUrl,
      studentIdPhotoUrl,
      status,
      adminNotes,
      aiVerdict: aiResult.verdict,
      aiConfidence: aiResult.confidence,
      aiNotes: aiResult.notes,
      statusHistory: [{ status, changedBy: req.user._id, note: adminNotes || 'Student submitted' }]
    });

    res.status(201).json(announcement);
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Student gets their own announcements
exports.getMyAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ student: req.user._id })
      .populate('internship', 'companyName field location')
      .sort({ createdAt: -1 });
    const safe = announcements.map(a => ({ ...a.toObject(), bankAccountEncrypted: undefined }));
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// University admin: get announcements for their university
exports.getUniversityAnnouncements = async (req, res) => {
  try {
    if (req.user.role !== 'UNIVERSITY_ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let filter = {};
    if (req.user.role === 'UNIVERSITY_ADMIN') {
      const students = await User.find({ university: req.user.university, role: 'STUDENT' }).select('_id');
      const studentIds = students.map(s => s._id);
      filter.student = { $in: studentIds };
    }

    const announcements = await Announcement.find(filter)
      .populate('student', 'fullName email')
      .populate('internship', 'companyName field location')
      .sort({ createdAt: -1 });

    const withDecrypted = announcements.map(a => {
      const obj = a.toObject();
      if (obj.bankAccountEncrypted) {
        try {
          obj.bankAccount = decrypt(obj.bankAccountEncrypted);
        } catch (e) {
          obj.bankAccount = 'Decryption error';
        }
      } else {
        obj.bankAccount = 'Not available';
      }
      delete obj.bankAccountEncrypted;
      return obj;
    });
    res.json(withDecrypted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// University admin: update announcement status with audit
exports.updateAnnouncementStatus = async (req, res) => {
  try {
    if (req.user.role !== 'UNIVERSITY_ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, note } = req.body;
    const validStatuses = ['PENDING', 'VERIFIED', 'STIPEND_SENT', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const announcement = await Announcement.findById(req.params.id).populate('student');
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (req.user.role === 'UNIVERSITY_ADMIN' && announcement.student.university !== req.user.university) {
      return res.status(403).json({ message: 'Not authorized for this student' });
    }

    if (announcement.status === 'REJECTED' && status !== 'PENDING') {
      return res.status(400).json({ message: 'Cannot change a rejected announcement' });
    }
    if (announcement.status === 'STIPEND_SENT') {
      return res.status(400).json({ message: 'Stipend already sent, cannot change' });
    }

    announcement.status = status;
    announcement.processedAt = new Date();
    announcement.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status changed to ${status} by ${req.user.role}`
    });
    await announcement.save();

    res.json({ message: `Status updated to ${status}`, announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Optional: standalone document verification (can be called before final submit)
exports.verifyDocument = async (req, res) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only students can verify documents' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Extract text and run AI (simulate or real)
    const extractedText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
    const aiResult = await verifyDocuments(extractedText, '', req.user, null);

    res.json({
      success: true,
      confidence: aiResult.confidence,
      passed: aiResult.verdict === 'valid',
      reason: aiResult.notes,
      message: aiResult.verdict === 'valid' ? 'Document looks valid.' : 'Document may be invalid or suspicious.'
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};