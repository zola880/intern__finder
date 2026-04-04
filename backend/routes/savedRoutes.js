const express = require('express');
const router = express.Router();
const savedController = require('../controllers/savedController');
const auth = require('../middleware/auth');

router.get('/', auth, savedController.getSavedInternships);
router.post('/:internshipId', auth, savedController.saveInternship);
router.delete('/:internshipId', auth, savedController.unsaveInternship);

module.exports = router;
// new
