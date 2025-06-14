const express = require('express');
const { createTrip, getAllTrips } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createTrip);
router.get('/', protect, getAllTrips);

module.exports = router;
