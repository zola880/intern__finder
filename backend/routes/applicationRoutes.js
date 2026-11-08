const express = require('express');
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { cvUpload } = require('../middleware/internshipUploads');

const router = express.Router();

router.use(auth);
router.post('/:internshipId', roleCheck('STUDENT'), cvUpload, applicationController.submitApplication);
router.get('/mine', roleCheck('STUDENT'), applicationController.getMyApplications);
router.get('/received', roleCheck('EMPLOYER', 'ADMIN'), applicationController.getReceivedApplications);
router.get('/:id/cv', applicationController.downloadCv);

module.exports = router;
