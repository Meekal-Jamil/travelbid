const express = require('express');
const {
  registerUser,
  loginUser,
  verifyToken,
  getProfile,
  updateProfile,
  getAllUsers
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/verify', protect, verifyToken);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, getAllUsers); // ✅ New route for inbox dropdown

module.exports = router;
