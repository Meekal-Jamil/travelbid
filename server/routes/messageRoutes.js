const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMessages,
  getChatUsers,
  getMessagesBetweenUsers
} = require('../controllers/messageController');

const router = express.Router();

// Old routes
router.post('/', protect, sendMessage);
router.get('/', protect, getMessages); // legacy

// ✅ New chat routes
router.get('/chats', protect, getChatUsers); // List chat partners
router.get('/conversation/:userId', protect, getMessagesBetweenUsers); // Conversation with a specific user

module.exports = router;
