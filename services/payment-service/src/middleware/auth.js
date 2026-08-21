const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_dev_key');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        expired: true,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

module.exports = { verifyToken };
