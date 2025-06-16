const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAgentStats } = require('../controllers/agentController');

// Get agent statistics
router.get('/stats', protect, getAgentStats);

module.exports = router; 