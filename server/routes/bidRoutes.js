const express = require('express');
const {
  submitBid,
  getBidsByTrip,
  acceptBid,
  rejectBid,
  confirmPayment,
  rateBid,
  getTravelerBookings
} = require('../controllers/bidController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST - agent submits a bid
router.post('/', protect, submitBid);

// GET - traveler views bids for a trip
router.get('/:tripId', protect, getBidsByTrip);

// PUT - agent rates a bid
router.put('/rate/:id', protect, rateBid);

// GET - traveler views their bookings
router.get('/bookings/traveler', protect, getTravelerBookings);

// PUT - accept a bid
router.put('/accept/:id', protect, acceptBid);

// PUT - reject a bid
router.put('/reject/:id', protect, rejectBid);

// PUT - confirm payment
router.put('/pay/:id', protect, confirmPayment);

module.exports = router;
