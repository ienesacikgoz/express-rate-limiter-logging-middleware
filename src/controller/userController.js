const logger = require('../config/logger');

/**
 * Mock user database (in production, use a real database)
 */
const users = new Map([
  [1, { userId: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date() }],
  [2, { userId: 2, email: 'jane@example.com', name: 'Jane Smith', createdAt: new Date() }],
]);

/**
 * Get all users (protected endpoint)
 * GET /api/users
 */
const getAllUsers = (req, res, next) => {
  try {
    const requestId = req.id || 'unknown';
    const userId = req.userId || 'anonymous';

    logger.info('Fetching all users', {
      requestId,
      userId,
    });

    const userList = Array.from(users.values()).map(user => ({
      userId: user.userId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }));

    res.json({
      data: userList,
      count: userList.length,
      requestId,
    });
  } catch (error) {
    logger.error('Get all users error', {
      requestId: req.id,
      error: error.message,
      stack: error.stack,
    });

    next(error);
  }
};

/**
 * Get user by ID (protected endpoint)
 * GET /api/users/:userId
 */
const getUserById = (req, res, next) => {
  try {
    const { userId: paramUserId } = req.params;
    const requestId = req.id || 'unknown';
    const currentUserId = req.userId || 'anonymous';

    const user = users.get(parseInt(paramUserId));

    if (!user) {
      logger.warn('User not found', {
        requestId,
        userId: currentUserId,
        targetUserId: paramUserId,
      });

      return res.status(404).json({
        error: 'user_not_found',
        message: `User with ID ${paramUserId} not found`,
        requestId,
      });
    }

    logger.info('User retrieved', {
      requestId,
      userId: currentUserId,
      targetUserId: paramUserId,
    });

    res.json({
      data: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      requestId,
    });
  } catch (error) {
    logger.error('Get user by ID error', {
      requestId: req.id,
      error: error.message,
      stack: error.stack,
    });

    next(error);
  }
};

/**
 * Update user profile (protected endpoint)
 * PUT /api/users/:userId
 */
const updateUser = (req, res, next) => {
  try {
    const { userId: paramUserId } = req.params;
    const { name, email } = req.body;
    const requestId = req.id || 'unknown';
    const currentUserId = req.userId || 'anonymous';

    // Check ownership
    if (parseInt(paramUserId) !== currentUserId) {
      logger.warn('Unauthorized update attempt', {
        requestId,
        userId: currentUserId,
        targetUserId: paramUserId,
        ip: req.ip,
      });

      return res.status(403).json({
        error: 'forbidden',
        message: 'You can only update your own profile',
        requestId,
      });
    }

    const user = users.get(parseInt(paramUserId));

    if (!user) {
      logger.warn('User not found during update', {
        requestId,
        userId: currentUserId,
        targetUserId: paramUserId,
      });

      return res.status(404).json({
        error: 'user_not_found',
        message: `User with ID ${paramUserId} not found`,
        requestId,
      });
    }

    // Update user
    if (name) user.name = name;
    if (email) user.email = email;
    user.updatedAt = new Date();

    logger.info('User profile updated', {
      requestId,
      userId: currentUserId,
      changes: { name, email },
    });

    res.json({
      message: 'Profile updated successfully',
      data: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        updatedAt: user.updatedAt,
      },
      requestId,
    });
  } catch (error) {
    logger.error('Update user error', {
      requestId: req.id,
      error: error.message,
      stack: error.stack,
    });

    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
};
