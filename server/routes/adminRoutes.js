const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllUsers, getAllTrips, getAgentStats } = require('../controllers/adminController');

const router = express.Router();

router.get('/users', protect, getAllUsers);
router.get('/trips', protect, getAllTrips);
router.get('/agent/stats', protect, getAgentStats);

module.exports = router;
