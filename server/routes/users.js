const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getMyOrders } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, require('../controllers/userController').changePassword);
router.put('/settings', auth, require('../controllers/userController').updateSettings);
router.post('/activate-trial', auth, require('../controllers/userController').activateFreeTrial);
router.get('/my-orders', auth, getMyOrders);

module.exports = router;
