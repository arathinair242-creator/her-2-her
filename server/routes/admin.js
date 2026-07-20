const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Basic token validation for admin routes
const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: "Admin access denied: No token" });
  
  const token = authHeader.split(" ")[1];
  if (token === 'admin_secure_token_abc123') {
    next();
  } else {
    res.status(403).json({ message: "Admin access denied" });
  }
};

router.post('/login', adminController.adminLogin);
router.get('/stats', isAdmin, adminController.getDashboardStats);
router.get('/analytics', isAdmin, adminController.getAnalytics);
router.get('/doctors', isAdmin, adminController.getDoctors);
router.put('/doctors/:id/status', isAdmin, adminController.updateDoctorStatus);
router.get('/users', isAdmin, adminController.getUsers);
router.get('/appointments', isAdmin, adminController.getAppointments);
router.get('/partners', isAdmin, adminController.getPartners);
router.put('/partners/:id/status', isAdmin, adminController.updatePartnerStatus);

module.exports = router;
