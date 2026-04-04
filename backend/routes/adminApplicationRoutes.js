const express = require('express');
const router = express.Router();
const adminAppController = require('../controllers/adminApplicationController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// User applies (must be logged in, not already admin)
router.post('/apply', auth, adminAppController.apply);

// Admin only routes
router.get('/', auth, roleCheck('ADMIN'), adminAppController.getApplications);
router.put('/:id/approve', auth, roleCheck('ADMIN'), adminAppController.approveApplication);
router.put('/:id/reject', auth, roleCheck('ADMIN'), adminAppController.rejectApplication);

module.exports = router;