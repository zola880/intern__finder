const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(auth);

// Student submits announcement (two files)
router.post('/',
  roleCheck('STUDENT'),
  upload.fields([
    { name: 'acceptanceLetter', maxCount: 1 },
    { name: 'studentIdPhoto', maxCount: 1 }
  ]),
  announcementController.createAnnouncement
);

// Student gets their own announcements
router.get('/my-announcements', announcementController.getMyAnnouncements);

// University admin gets all announcements for their university
router.get('/university', roleCheck('UNIVERSITY_ADMIN', 'ADMIN'), announcementController.getUniversityAnnouncements);

// University admin updates status
router.put('/:id/status', roleCheck('UNIVERSITY_ADMIN', 'ADMIN'), announcementController.updateAnnouncementStatus);

// AI document verification (single file)
router.post('/verify', roleCheck('STUDENT'), upload.single('document'), announcementController.verifyDocument);

module.exports = router;