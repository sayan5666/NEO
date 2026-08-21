const errorHandler = (err, req, res, next) => {
  console.error('[Interview Service Error]', err.stack || err.message || err);

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for field ${err.path}`,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Database validation error',
      errors: messages,
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
