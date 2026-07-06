const logger = require('../config/logger');

/**
 * Custom error handling middleware
 * Catches and logs errors with proper HTTP status codes
 */
const errorHandler = (err, req, res, next) => {
  const requestId = req.id || 'unknown';
  const userId = req.userId || 'anonymous';

  // Log error details
  logger.error('Request error', {
    requestId,
    userId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Determine status code
  const statusCode = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Format error response
  const errorResponse = {
    error: err.code || 'internal_error',
    message: err.message || 'An internal server error occurred',
    requestId,
    ...(isDevelopment && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  const requestId = req.id || 'unknown';

  logger.warn('Route not found', {
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    error: 'not_found',
    message: `Route ${req.method} ${req.path} not found`,
    requestId,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
