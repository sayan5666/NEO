const express = require('express');
const router = express.Router();

const {
  getReportBySessionId,
  createOrUpdateReport,
} = require('../controllers/reportController');

const {
  validateReportSessionId,
  handleValidationErrors,
} = require('../middleware/validate');

const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/:sessionId', validateReportSessionId, handleValidationErrors, getReportBySessionId);
router.post('/', createOrUpdateReport);

module.exports = router;
