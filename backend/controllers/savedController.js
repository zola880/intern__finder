const SavedInternship = require('../models/SavedInternship');
const Internship = require('../models/Internship');

// GET /api/saved - list saved internships for current user
exports.getSavedInternships = async (req, res) => {
  try {
    const saved = await SavedInternship.find({ userId: req.user.id });
    res.json(saved);
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
      userId: req.user.id,
      internshipId: req.params.internshipId,
    });
    if (existing) {
      return res.status(400).json({ message: 'Already saved' });
    }

    await SavedInternship.create({
      userId: req.user.id,
      internshipId: req.params.internshipId,
    });
    res.status(201).json({ message: 'Saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/saved/:internshipId - unsave an internship
exports.unsaveInternship = async (req, res) => {
  try {
    const result = await SavedInternship.findOneAndDelete({
      userId: req.user.id,
      internshipId: req.params.internshipId,
    });
    if (!result) {
      return res.status(404).json({ message: 'Not found in saved list' });
    }
    res.json({ message: 'Removed from saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
