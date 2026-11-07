const Internship = require('../models/Internship');

// @desc    Get all internships (filtered by role)
exports.getAllInternships = async (req, res) => {
  try {
    const { search, field, status, page = 1, limit = 10, sort = 'newest' } = req.query;

    const role = req.user ? req.user.role : null;
    const submittedBy = req.user ? req.user.id : null;

    const internships = await Internship.find({
      search,
      field,
      status,
      page,
      limit,
      sort,
      role,
      submittedBy,
      approvalStatus: req.query.approvalStatus,
    });

    const total = await Internship.countDocuments({
      search,
      field,
      status,
      role,
      submittedBy,
      approvalStatus: req.query.approvalStatus,
    });

    res.json({
      data: internships,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single internship
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Not found' });

    if (req.user && req.user.role === 'STUDENT' && internship.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user && req.user.role === 'EMPLOYER' && internship.submittedBy?.id?.toString() !== req.user.id?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(internship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create internship (any authenticated user)
exports.createInternship = async (req, res) => {
  try {
    const { role } = req.user;
    const internship = await Internship.create({
      ...req.body,
      submittedBy: req.user.id,
      approvalStatus: role === 'ADMIN' ? 'APPROVED' : 'PENDING',
    });
    res.status(201).json(internship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update internship (owner or admin)
exports.updateInternship = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'ADMIN' && internship.submittedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'ADMIN' && req.body.approvalStatus === 'APPROVED' && internship.approvalStatus !== 'APPROVED') {
      req.body.approvedAt = new Date();
    }

    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete internship (admin only)
exports.deleteInternship = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin only' });
    }
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Internship deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin: approve internship
exports.approveInternship = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Not found' });

    const updated = await Internship.findByIdAndUpdate(req.params.id, {
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
    });
    res.json({ message: 'Internship approved', internship: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin: reject internship
exports.rejectInternship = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const { reason } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    const updated = await Internship.findByIdAndUpdate(req.params.id, {
      approvalStatus: 'REJECTED',
      adminNotes: reason || 'No reason provided',
    });
    res.json({ message: 'Internship rejected', internship: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
