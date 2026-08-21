const express = require('express');
const router = express.Router();

const {
  createSession,
  getSessionById,
  listSessions,
  updateSession,
} = require('../controllers/sessionController');

const {
  validateCreateSession,
  validateSessionId,
  validateUpdateSession,
  handleValidationErrors,
} = require('../middleware/validate');

const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', validateCreateSession, handleValidationErrors, createSession);
router.get('/', listSessions);
router.get('/:id', validateSessionId, handleValidationErrors, getSessionById);
router.patch('/:id', validateUpdateSession, handleValidationErrors, updateSession);

module.exports = router;
