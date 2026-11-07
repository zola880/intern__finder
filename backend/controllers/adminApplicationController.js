const AdminApplication = require('../models/AdminApplication');
const User = require('../models/User');

// User submits application
exports.apply = async (req, res) => {
  try {
    const { universityName, reason } = req.body;
    if (!universityName || !reason) {
      return res.status(400).json({ message: 'University name and reason are required' });
    }

    const existing = await AdminApplication.findOne({ applicantId: req.user.id, status: 'PENDING' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending application' });
    }

    const application = await AdminApplication.create({
      applicantId: req.user.id,
      universityName,
      reason,
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Super admin: get all applications (with optional status filter)
exports.getApplications = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const { status } = req.query;
    const applications = await AdminApplication.find({ status });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Super admin: approve application
exports.approveApplication = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const application = await AdminApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'PENDING') {
      return res.status(400).json({ message: `Application already ${application.status}` });
    }

    await User.findByIdAndUpdate(application.applicant.id, {
      role: 'UNIVERSITY_ADMIN',
      university: application.universityName,
    });

    await AdminApplication.updateById(req.params.id, {
      status: 'APPROVED',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });

    res.json({ message: 'Application approved. User is now a university admin.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Super admin: reject application
exports.rejectApplication = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const { reason } = req.body;
    const application = await AdminApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'PENDING') {
      return res.status(400).json({ message: `Application already ${application.status}` });
    }

    await AdminApplication.updateById(req.params.id, {
      status: 'REJECTED',
      adminNotes: reason || 'No reason provided',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });

    res.json({ message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
