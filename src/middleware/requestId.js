const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Middleware to add request correlation ID
 * Generates a unique ID for each request for distributed tracing
 */
const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.id = requestId;

  // Set response header
  res.setHeader('X-Request-ID', requestId);

  // Add to logger context for all future logs in this request
  res.on('finish', () => {
    logger.info(`Request completed`, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${Date.now() - req.startTime}ms`,
    });
  });

  req.startTime = Date.now();
  next();
};

module.exports = requestIdMiddleware;
