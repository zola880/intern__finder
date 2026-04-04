const Internship = require('../models/Internship');

// @desc    Get all internships (filtered by role)
exports.getAllInternships = async (req, res) => {
  try {
    const { search, field, status, page = 1, limit = 10, sort = 'newest' } = req.query;
    const filter = {};

    // Role‑based visibility – this cannot be overridden by query params
    if (req.user.role === 'STUDENT') {
      filter.approvalStatus = 'APPROVED';
    } else if (req.user.role === 'EMPLOYER') {
      filter.submittedBy = req.user._id;
    }
    // ADMIN sees all – but they can optionally filter by approvalStatus via query
    else if (req.user.role === 'ADMIN' && req.query.approvalStatus) {
      filter.approvalStatus = req.query.approvalStatus;
    }

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }
    if (field && field !== 'All') filter.field = field;
    if (status) filter.status = status;

    let sortOption = {};
    if (sort === 'deadline_asc') sortOption = { deadline: 1 };
    else if (sort === 'deadline_desc') sortOption = { deadline: -1 };
    else sortOption = { createdAt: -1 };

    const internships = await Internship.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('submittedBy', 'fullName email');

    const total = await Internship.countDocuments(filter);

    res.json({
      data: internships,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single internship
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('submittedBy', 'fullName email');
    if (!internship) return res.status(404).json({ message: 'Not found' });

    if (req.user.role === 'STUDENT' && internship.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'EMPLOYER' && internship.submittedBy.toString() !== req.user._id.toString()) {
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
    const { _id, role } = req.user;
    const internship = await Internship.create({
      ...req.body,
      submittedBy: _id,
      approvalStatus: role === 'ADMIN' ? 'APPROVED' : 'PENDING'
    });
    res.status(201).json(internship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update internship (owner or admin)
exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'ADMIN' && internship.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'ADMIN' && req.body.approvalStatus === 'APPROVED' && internship.approvalStatus !== 'APPROVED') {
      req.body.approvedAt = new Date();
    }

    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

    internship.approvalStatus = 'APPROVED';
    internship.approvedAt = new Date();
    await internship.save();
    res.json({ message: 'Internship approved', internship });
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

    internship.approvalStatus = 'REJECTED';
    internship.adminNotes = reason || 'No reason provided';
    await internship.save();
    res.json({ message: 'Internship rejected', internship });
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
    if (!internship) return res.status(404).json({ message: 'Not found' });

    internship.approvalStatus = 'REJECTED';
    internship.adminNotes = reason || 'No reason provided';
    await internship.save();
    res.json({ message: 'Internship rejected', internship });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// new
