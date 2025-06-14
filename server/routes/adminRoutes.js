const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getAllUsers, getAllTrips } = require('../controllers/adminController');

const router = express.Router();

router.get('/users', protect, getAllUsers);
router.get('/trips', protect, getAllTrips);

module.exports = router;
