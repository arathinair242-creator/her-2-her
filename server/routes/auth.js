const express = require('express');
const router = express.Router();
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const { registerUser, loginUser, registerExpert, loginExpert, registerPartner, loginPartner, googleAuth } = require('../controllers/authController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
});

router.post('/register/user', registerUser);
router.post('/login/user', loginUser);
router.post('/register/expert', registerExpert);
router.post('/login/expert', loginExpert);
router.post('/register/partner', registerPartner);
router.post('/login/partner', loginPartner);
router.post('/google', googleAuth);

// File Upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, fileUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
