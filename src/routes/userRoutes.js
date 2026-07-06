const express = require('express');
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/auth');
const { userLimiter } = require('../config/rateLimiter');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);
router.use(userLimiter);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Update user profile
router.put('/:userId', userController.updateUser);

module.exports = router;
