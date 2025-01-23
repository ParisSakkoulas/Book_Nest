
// auth routes
const express = require('express');
const { registerUser, loginUser, getUserProfile, verifyUser, resentVerificationEmail, userStatusUpdate } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

const router = express.Router();

// Route: Register a new user
router.post('/register', registerUser);

// Route: Login user
router.post('/login', loginUser);

// Route : sent verificaiton link
router.get('/sentLink/:customerId', authenticateToken, requireAdmin, resentVerificationEmail);

// Route : verify account
router.patch('/verify/:customerId', authenticateToken, requireAdmin, userStatusUpdate);

// Route: Get user profile (protected route)
router.get('/profile', authenticateToken, getUserProfile);

// Route: Get verification code to verify user account
router.get("/verify/:confirmationCode", verifyUser);

module.exports = router;
