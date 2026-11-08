const fs = require('fs/promises');
const path = require('path');
const Internship = require('../models/Internship');
const InternshipApplication = require('../models/InternshipApplication');
const { getPrivateCvPath, removePrivateCv, savePrivateCv } = require('../services/applicationFileStorage');

exports.submitApplication = async (req, res) => {
  let cvStorageKey;
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only student accounts can apply to internships' });
    }
    if (!req.file) return res.status(400).json({ message: 'Upload your CV as a PDF to apply' });

    const internship = await Internship.findById(req.params.internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    if (internship.approvalStatus !== 'APPROVED' || internship.status !== 'Open') {
      return res.status(400).json({ message: 'This internship is not accepting applications' });
    }
    if (internship.deadline && new Date(internship.deadline) < new Date()) {
      return res.status(400).json({ message: 'The application deadline has passed' });
    }

    const fullName = String(req.body.fullName || '').trim();
    const phone = String(req.body.phone || '').trim();
    const coverLetter = String(req.body.coverLetter || '').trim();
    if (fullName.length < 2 || fullName.length > 255) {
      return res.status(400).json({ message: 'Enter your full name (2-255 characters)' });
    }
    if (!/^[+()\d\s.-]{7,25}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }
    if (coverLetter.length < 20 || coverLetter.length > 10000) {
      return res.status(400).json({ message: 'Cover letter must be between 20 and 10000 characters' });
    }

    cvStorageKey = await savePrivateCv(req.file);
    const application = await InternshipApplication.create({
      internshipId: internship.id,
      studentId: req.user.id,
      fullName,
      email: req.user.email,
      phone,
      coverLetter,
      cvStorageKey,
      cvOriginalName: path.basename(req.file.originalname).slice(0, 255),
    });

    res.status(201).json({ message: 'Your application was submitted', application });
  } catch (error) {
    if (cvStorageKey) await removePrivateCv(cvStorageKey);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'You have already applied to this internship' });
    }
    console.error('Internship application submission failed:', error);
    res.status(500).json({ message: 'Could not submit your application. Please try again.' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only student accounts can view submitted applications' });
    }
    const applications = await InternshipApplication.findByStudent(req.user.id);
    res.json(applications);
  } catch (error) {
    console.error('Loading student applications failed:', error);
    res.status(500).json({ message: 'Could not load your applications' });
  }
};

exports.getReceivedApplications = async (req, res) => {
  try {
    if (!['EMPLOYER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only host companies can view received applications' });
    }
    const applications = await InternshipApplication.findReceivedByEmployer(
      req.user.id,
      req.user.role === 'ADMIN',
    );
    res.json(applications);
  } catch (error) {
    console.error('Loading received applications failed:', error);
    res.status(500).json({ message: 'Could not load received applications' });
  }
};

exports.downloadCv = async (req, res) => {
  try {
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    const canView = req.user.role === 'ADMIN'
      || (req.user.role === 'STUDENT' && String(application.student_id) === String(req.user.id))
      || (req.user.role === 'EMPLOYER' && String(application.submitted_by) === String(req.user.id));
    if (!canView) return res.status(403).json({ message: 'You are not allowed to view this CV' });

    const cvPath = getPrivateCvPath(application.cv_storage_key);
    await fs.access(cvPath);
    res.download(cvPath, `application-${application.id}-cv.pdf`, error => {
      if (error && !res.headersSent) {
        console.error('CV download failed:', error);
        res.status(500).json({ message: 'Could not download the CV' });
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ message: 'CV file not found' });
    console.error('CV download failed:', error);
    res.status(500).json({ message: 'Could not download the CV' });
  }
};
