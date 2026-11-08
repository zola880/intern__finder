const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.use(auth);
router.post('/chat', aiController.chat);
router.post('/analyze-image', aiController.imageUploadMiddleware, aiController.analyzeImage);
router.post('/transcribe', aiController.uploadMiddleware, aiController.transcribe);
router.post('/speak', aiController.speak);
router.post('/generate-cv', aiController.generateCV);
router.post('/cover-letter', aiController.generateCoverLetter);
router.post('/interview-questions', aiController.generateInterviewQuestions);

module.exports = router;
