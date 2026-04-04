const { getChatResponse, generateCV, generateCoverLetter, generateInterviewQuestions } = require('../services/groqService');
const Internship = require('../models/Internship');

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    // Fetch available internships for suggestions
    const internships = await Internship.find({ approvalStatus: 'APPROVED', status: 'Open' }).limit(20);
    const aiReply = await getChatResponse(message, req.user, history, internships);
    res.json({ reply: aiReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI unavailable' });
  }
};

exports.generateCV = async (req, res) => {
  try {
    const cv = await generateCV(req.user);
    res.json({ cv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate CV' });
  }
};

exports.generateCoverLetter = async (req, res) => {
  try {
    const { internshipId, tone = 'professional' } = req.body;
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    const letter = await generateCoverLetter(req.user, internship, tone);
    res.json({ coverLetter: letter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate cover letter' });
  }
};

exports.generateInterviewQuestions = async (req, res) => {
  try {
    const { internshipId, count = 5 } = req.body;
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    const questions = await generateInterviewQuestions(internship, count);
    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate interview questions' });
  }
};