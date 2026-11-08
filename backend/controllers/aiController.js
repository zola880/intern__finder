const Internship = require('../models/Internship');
const multer = require('multer');

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
});

function createUploadMiddleware(field, acceptedType, label) {
  const middleware = upload.single(field);
  return (req, res, next) => middleware(req, res, error => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: error.message });
    }
    if (req.file && !acceptedType.test(req.file.mimetype)) {
      return res.status(400).json({ message: `${label} file type is not supported` });
    }
    next();
  });
}

exports.uploadMiddleware = createUploadMiddleware('audio', /^audio\/(webm|mp4|ogg|wav|mpeg|mp3|x-m4a)(;|$)/i, 'Audio');
exports.imageUploadMiddleware = createUploadMiddleware('image', /^image\/(jpeg|png|webp|gif)$/i, 'Image');

function normalizeHistory(history) {
  if (typeof history === 'string') {
    try {
      history = JSON.parse(history);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(history)) return [];
  return history
    .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .slice(-20)
    .map(item => ({ role: item.role, content: item.content.slice(0, 4000) }));
}

function validateImageData(image) {
  if (typeof image !== 'string') return false;
  const base64 = image.replace(/^data:image\/(?:jpeg|png|webp|gif);base64,/i, '');
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(base64)) return false;
  return Math.floor(base64.replace(/\s/g, '').length * 0.75) <= MAX_UPLOAD_SIZE;
}

function getErrorMessage(error, fallback) {
  console.error(fallback, error);
  if (error.message === 'GROQ_API_KEY is not configured') {
    return 'AI is not configured. Add GROQ_API_KEY to the backend .env file and restart the server.';
  }
  return fallback;
}

exports.chat = async (req, res) => {
  try {
    const { message, image } = req.body || {};
    const history = normalizeHistory(req.body?.history);
    if ((!message || typeof message !== 'string' || !message.trim()) && !image) {
      return res.status(400).json({ message: 'Message or image required' });
    }

    const internships = await Internship.find({
      approvalStatus: 'APPROVED',
      status: 'Open',
      page: 1,
      limit: 20,
      sort: 'newest',
    });

    const { getChatResponse, getVisionResponse } = require('../services/groqService');

    if (image) {
      if (!validateImageData(image)) return res.status(400).json({ message: 'Image is invalid or exceeds 10 MB' });
      const reply = await getVisionResponse(message || 'What is in this image?', image, req.user, history);
      return res.json({ reply });
    }

    const aiReply = await getChatResponse(message.trim(), req.user, history, internships);
    res.json({ reply: aiReply });
  } catch (error) {
    const message = getErrorMessage(error, 'AI request failed. Please try again.');
    res.status(error.message === 'GROQ_API_KEY is not configured' ? 503 : 502).json({ message });
  }
};

exports.analyzeImage = async (req, res) => {
  try {
    const { image, message } = req.body || {};
    const history = normalizeHistory(req.body?.history);
    if (!req.file && !image) return res.status(400).json({ message: 'Image required' });
    if (!req.file && !validateImageData(image)) {
      return res.status(400).json({ message: 'Image is invalid or exceeds 10 MB' });
    }
    const { getVisionResponse } = require('../services/groqService');
    const imageData = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : image;
    const reply = await getVisionResponse(message || 'Describe this image.', imageData, req.user, history);
    res.json({ reply });
  } catch (error) {
    const message = getErrorMessage(error, 'Image analysis failed. Please try again.');
    res.status(error.message === 'GROQ_API_KEY is not configured' ? 503 : 502).json({ message });
  }
};

exports.transcribe = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Audio file required' });
    const { transcribeAudio } = require('../services/groqService');
    const text = await transcribeAudio(req.file.buffer, req.file.originalname || 'audio.webm');
    res.json({ text });
  } catch (error) {
    const message = getErrorMessage(error, 'Audio transcription failed. Please try again.');
    res.status(error.message === 'GROQ_API_KEY is not configured' ? 503 : 502).json({ message });
  }
};

exports.speak = async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ message: 'Text required' });
    if (text.length > 3000) return res.status(413).json({ message: 'Text exceeds the 3000 character limit' });
    const { textToSpeech } = require('../services/groqService');
    const audio = await textToSpeech(text);
    res.set('Content-Type', 'audio/wav');
    res.send(audio);
  } catch (error) {
    const message = getErrorMessage(error, 'Voice playback is unavailable right now.');
    res.status(error.message === 'GROQ_API_KEY is not configured' ? 503 : 502).json({ message });
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
