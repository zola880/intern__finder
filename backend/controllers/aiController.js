const Internship = require('../models/Internship');

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const internships = await Internship.find({
      approvalStatus: 'APPROVED',
      status: 'Open',
      page: 1,
      limit: 20,
      sort: 'newest',
    });

    const { getChatResponse, generateCV, generateCoverLetter, generateInterviewQuestions } = require('../services/groqService');
    const aiReply = await getChatResponse(message, req.user, history, internships);
    res.json({ reply: aiReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI unavailable' });
  }
};

exports.generateCV = async (req, res) => {
  try {
    const { generateCV } = require('../services/groqService');
    const cv = await generateCV(req.user);
    res.json({ cv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate CV' });
  }
};

exports.generateCoverLetter = async (req, res) => {
  try {
    const { generateCoverLetter } = require('../services/groqService');
    const { internshipId, tone = 'professional' } = req.body;
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    const letter = await generateCoverLetter(req.user, internship, tone);
    res.json({ coverLetter: letter });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate cover letter' });
  }
};

exports.generateInterviewQuestions = async (req, res) => {
  try {
    const { generateInterviewQuestions } = require('../services/groqService');
    const { internshipId, count = 5 } = req.body;
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    const questions = await generateInterviewQuestions(internship, count);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate interview questions' });
  }
};
