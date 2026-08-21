const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');
const { uploadResume, getResume } = require('../controllers/resumeController');

// Optional auth helper: if token is present, decode it; if not, continue so guest uploads can parse PDF
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

// POST /resume/upload
router.post('/upload', optionalVerifyToken, upload.single('resume'), uploadResume);

// GET /resume/me
router.get('/me', verifyToken, getResume);

// GET /resume/user/:userId
router.get('/user/:userId', getResume);

module.exports = router;
