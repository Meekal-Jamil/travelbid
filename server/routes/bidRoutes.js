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
const Trip = require('../models/Trip');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Debug route to check trips and bids
router.get('/debug/trips', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ traveler: req.user._id })
      .populate('traveler', 'name')
      .populate('bids.agent', 'name');
    
    console.log('Debug - User ID:', req.user._id);
    console.log('Debug - Found trips:', trips);
    
    res.json({
      userId: req.user._id,
      tripsCount: trips.length,
      trips: trips
    });
  } catch (err) {
    console.error('Debug error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - traveler views their bookings
router.get('/bookings/traveler', protect, getTravelerBookings);

// POST - agent submits a bid
router.post('/', protect, submitBid);

// PUT - agent rates a bid
router.put('/rate/:id', protect, rateBid);

// PUT - accept a bid
router.put('/accept/:id', protect, acceptBid);

// PUT - reject a bid
router.put('/reject/:id', protect, rejectBid);

// PUT - confirm payment
router.put('/pay/:id', protect, confirmPayment);

// GET - traveler views bids for a trip
router.get('/:tripId', protect, getBidsByTrip);

module.exports = router;
