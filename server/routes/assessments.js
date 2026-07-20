const express = require('express');
const router = express.Router();
const { saveAssessment, getMyPlan, getHistory } = require('../controllers/assessmentController');
const auth = require('../middleware/auth');

router.post('/', auth, saveAssessment);
router.get('/my-plan', auth, getMyPlan);
router.get('/history', auth, getHistory);

module.exports = router;
