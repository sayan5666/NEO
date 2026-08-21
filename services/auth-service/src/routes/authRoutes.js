const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  googleAuth,
  refreshToken,
  getMe,
} = require('../controllers/authController');

const {
  validateSignup,
  validateLogin,
  validateRefreshToken,
  handleValidationErrors,
} = require('../middleware/validate');

const { verifyToken } = require('../middleware/auth');

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/google', googleAuth);
router.post('/refresh', validateRefreshToken, handleValidationErrors, refreshToken);
router.get('/me', verifyToken, getMe);

module.exports = router;
