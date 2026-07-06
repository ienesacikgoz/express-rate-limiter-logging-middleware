const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

/**
 * Mock user database (in production, use a real database)
 */
const users = new Map();

/**
 * Generate JWT token
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const requestId = req.id || 'unknown';

    // Input validation
    if (!email || !password || !name) {
      logger.warn('Invalid registration data', {
        requestId,
        email,
        ip: req.ip,
      });

      return res.status(400).json({
        error: 'validation_error',
        message: 'Email, password, and name are required',
        requestId,
      });
    }

    // Check if user exists
    if (users.has(email)) {
      logger.warn('Registration attempt with existing email', {
        requestId,
        email,
        ip: req.ip,
      });

      return res.status(409).json({
        error: 'email_already_exists',
        message: 'This email is already registered',
        requestId,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = Math.floor(Math.random() * 100000);
    const user = {
      userId,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    };

    users.set(email, user);

    // Generate token
    const token = generateToken(userId, email);

    logger.info('User registered successfully', {
      requestId,
      userId,
      email,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        userId,
        email,
        name,
      },
      requestId,
    });
  } catch (error) {
    logger.error('Registration error', {
      requestId: req.id,
      error: error.message,
      stack: error.stack,
    });

    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const requestId = req.id || 'unknown';

    // Input validation
    if (!email || !password) {
      logger.warn('Invalid login data', {
        requestId,
        email,
        ip: req.ip,
      });

      return res.status(400).json({
        error: 'validation_error',
        message: 'Email and password are required',
        requestId,
      });
    }

    // Find user
    const user = users.get(email);

    if (!user) {
      logger.warn('Login attempt with non-existent email', {
        requestId,
        email,
        ip: req.ip,
      });

      return res.status(401).json({
        error: 'invalid_credentials',
        message: 'Invalid email or password',
        requestId,
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      logger.warn('Failed login attempt', {
        requestId,
        email,
        ip: req.ip,
      });

      return res.status(401).json({
        error: 'invalid_credentials',
        message: 'Invalid email or password',
        requestId,
      });
    }

    // Generate token
    const token = generateToken(user.userId, user.email);

    logger.info('User logged in successfully', {
      requestId,
      userId: user.userId,
      email,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      requestId,
    });
  } catch (error) {
    logger.error('Login error', {
      requestId: req.id,
      error: error.message,
      stack: error.stack,
    });

    next(error);
  }
};

module.exports = {
  register,
  login,
  generateToken,
};
