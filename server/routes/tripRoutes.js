const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const tripController = require('../controllers/tripController');

// Create a new trip
router.post('/', protect, tripController.createTrip);

// Get all trips (filtered by user role)
router.get('/', protect, tripController.getAllTrips);

// Get a single trip
router.get('/:id', protect, tripController.getTrip);

// Place a bid on a trip
router.post('/:id/bid', protect, tripController.placeBid);

// Handle bid action (accept/reject)
router.put('/:id/bid/:bidId', protect, tripController.handleBidAction);

// Search trips
router.get('/search', protect, tripController.searchTrips);

module.exports = router;
