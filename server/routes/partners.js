const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPartnerProfile,
  updatePartnerProfile,
  addEvent,
  deleteEvent,
  addReferral,
  deleteReferral,
  getAnalytics
} = require('../controllers/partnerController');

router.get('/profile', auth, getPartnerProfile);
router.put('/profile', auth, updatePartnerProfile);

router.post('/events', auth, addEvent);
router.delete('/events/:eventId', auth, deleteEvent);

router.post('/referrals', auth, addReferral);
router.delete('/referrals/:referralId', auth, deleteReferral);

router.get('/analytics', auth, getAnalytics);

module.exports = router;
