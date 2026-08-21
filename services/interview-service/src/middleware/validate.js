const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const validateCreateSession = [
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required (e.g., "Full Stack Engineer", "Backend Developer")'),
  body('track')
    .trim()
    .notEmpty()
    .withMessage('Track is required (e.g., "technical", "system-design", "behavioral")'),
  body('currentAgent')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('currentAgent cannot be empty if specified'),
];

const validateSessionId = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID format'),
];

const validateReportSessionId = [
  param('sessionId')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid sessionId format'),
];

const validateUpdateSession = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID format'),
  body('status')
    .optional()
    .isIn(['in-progress', 'completed'])
    .withMessage('Status must be either "in-progress" or "completed"'),
  body('currentAgent')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('currentAgent cannot be empty'),
  body('transcriptEntry')
    .optional()
    .isObject()
    .withMessage('transcriptEntry must be an object with agent, question, and optional answer'),
  body('transcriptEntry.agent')
    .if(body('transcriptEntry').exists())
    .notEmpty()
    .withMessage('transcriptEntry.agent is required'),
  body('transcriptEntry.question')
    .if(body('transcriptEntry').exists())
    .notEmpty()
    .withMessage('transcriptEntry.question is required'),
  body('transcriptEntry.answer')
    .optional()
    .isString()
    .withMessage('transcriptEntry.answer must be a string'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: extractedErrors[0]?.message || 'Validation failed',
      errors: extractedErrors,
    });
  }
  next();
};

module.exports = {
  validateCreateSession,
  validateSessionId,
  validateReportSessionId,
  validateUpdateSession,
  handleValidationErrors,
};
