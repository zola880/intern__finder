const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

router.get('/', internshipController.getAllInternships);
router.get('/:id', internshipController.getInternshipById);
router.post('/', internshipController.createInternship);
router.put('/:id', internshipController.updateInternship);
router.delete('/:id', roleCheck('ADMIN'), internshipController.deleteInternship);
router.put('/:id/approve', roleCheck('ADMIN'), internshipController.approveInternship);
router.put('/:id/reject', roleCheck('ADMIN'), internshipController.rejectInternship);

module.exports = router;
// new
