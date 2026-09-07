const express = require('express');
const router = express.Router();
const config = require('../config');
const { createConsultation, getMyConsultations, getAiResponse, getExpertConsultations } = require('../controllers/consultationController');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const rawToken = req.header('Authorization');
    const token = rawToken?.replace('Bearer ', '');
    
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

router.post('/book', auth, createConsultation);
router.get('/my', auth, getMyConsultations);
router.get('/expert-my', auth, getExpertConsultations);
router.put('/:id/status', auth, require('../controllers/consultationController').updateConsultationStatus);
router.post('/ai-chat', getAiResponse);

module.exports = router;
