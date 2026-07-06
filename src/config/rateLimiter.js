const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const logger = require('./logger');

/**
 * Generic rate limiter factory
 * Can be configured for IP-based or user-based limiting
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000), // 15 minutes
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    message = 'Too many requests, please try again later',
    standardHeaders = true,
    legacyHeaders = false,
    keyGenerator = ipKeyGenerator,
    skip = (req) => false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders,
    legacyHeaders,
    keyGenerator,
    skip,
    handler: (req, res) => {
      const requestId = req.id || 'unknown';
      const userId = req.userId || 'anonymous';

      logger.warn('Rate limit exceeded', {
        requestId,
        userId,
        ip: req.ip,
        path: req.path,
      });

      res.status(429).json({
        error: 'rate_limit_exceeded',
        message,
        retryAfter: req.rateLimit.resetTime,
      });
    },
  });
};

/**
 * IP-based rate limiter for general API endpoints
 */
const ipLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Too many requests from this IP, please try again later',
});

/**
 * Stricter rate limiter for authentication endpoints
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  skip: (req) => {
    // Don't rate limit GET requests
    return req.method === 'GET';
  },
});

/**
 * User-based rate limiter (requires authentication)
 */
const createUserLimiter = (options = {}) => {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      // Use user ID if authenticated, fall back to IP using ipKeyGenerator for IPv6 safety
      return req.userId ? `user_${req.userId}` : ipKeyGenerator(req);
    },
  });
};

const userLimiter = createUserLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'User rate limit exceeded',
});

module.exports = {
  createRateLimiter,
  ipLimiter,
  authLimiter,
  userLimiter,
};
