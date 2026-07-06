const express = require('express');
const authController = require('../controller/authController');
const { authLimiter } = require('../config/rateLimiter');

const router = express.Router();

// Apply stricter rate limiting to auth endpoints
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

module.exports = router;
