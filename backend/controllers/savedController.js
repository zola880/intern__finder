const SavedInternship = require('../models/SavedInternship');
const Internship = require('../models/Internship');

// GET /api/saved - list saved internships for current user
exports.getSavedInternships = async (req, res) => {
  try {
    const saved = await SavedInternship.find({ user: req.user._id })
      .populate('internship')
      .sort({ createdAt: -1 });
    res.json(saved.map(s => s.internship));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/saved/:internshipId - save an internship
exports.saveInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const existing = await SavedInternship.findOne({
      user: req.user._id,
      internship: req.params.internshipId
    });
    if (existing) {
      return res.status(400).json({ message: 'Already saved' });
    }

    const saved = await SavedInternship.create({
      user: req.user._id,
      internship: req.params.internshipId
    });
    res.status(201).json({ message: 'Saved successfully', saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/saved/:internshipId - unsave an internship
exports.unsaveInternship = async (req, res) => {
  try {
    const result = await SavedInternship.findOneAndDelete({
      user: req.user._id,
      internship: req.params.internshipId
    });
    if (!result) {
      return res.status(404).json({ message: 'Not found in saved list' });
    }
    res.json({ message: 'Removed from saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// new
