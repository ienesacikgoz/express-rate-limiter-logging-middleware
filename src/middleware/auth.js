const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * JWT authentication middleware
 * Verifies bearer token and extracts user information
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const requestId = req.id || 'unknown';

  if (!authHeader) {
    logger.warn('Missing authorization header', {
      requestId,
      path: req.path,
      ip: req.ip,
    });

    return res.status(401).json({
      error: 'missing_authorization',
      message: 'Authorization header is required',
      requestId,
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn('Invalid authorization header format', {
      requestId,
      path: req.path,
      ip: req.ip,
    });

    return res.status(401).json({
      error: 'invalid_authorization_format',
      message: 'Authorization header must be "Bearer <token>"',
      requestId,
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;

    logger.debug('User authenticated', {
      requestId,
      userId: req.userId,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.warn('JWT verification failed', {
      requestId,
      error: error.message,
      path: req.path,
      ip: req.ip,
    });

    const errorCode = error.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token';
    const statusCode = error.name === 'TokenExpiredError' ? 401 : 401;

    return res.status(statusCode).json({
      error: errorCode,
      message: error.message,
      requestId,
    });
  }
};

module.exports = authMiddleware;
