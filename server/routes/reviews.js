const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Admin middleware (reuse same token validation as admin routes)
const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: 'Admin access denied: No token' });
  const token = authHeader.split(' ')[1];
  if (token === 'admin_secure_token_abc123') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access denied' });
  }
};

// Public routes
router.post('/', reviewController.submitReview);
router.get('/', reviewController.getPublicReviews);

// Admin route
router.get('/all', isAdmin, reviewController.getAllReviews);

module.exports = router;
