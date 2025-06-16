const Bid = require('../models/Bid');
const Trip = require('../models/Trip');

// Submit a bid (Agent)
const submitBid = async (req, res) => {
  try {
    const { trip, price, services } = req.body;
    const newBid = await Bid.create({
      trip,
      agent: req.user._id,
      price,
      services
    });
    res.status(201).json(newBid);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get bids for a specific trip (Traveler)
const getBidsByTrip = async (req, res) => {
  try {
    const bids = await Bid.find({ trip: req.params.tripId })
      .populate('agent', 'name email');
    res.json(bids);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Accept a bid (Traveler)
const acceptBid = async (req, res) => {
  try {
    const bidId = req.params.id;
    console.log('Accepting bid:', bidId);

    // Find the trip that contains this bid
    const trip = await Trip.findOne({ 'bids._id': bidId });
    if (!trip) {
      console.log('Trip not found for bid:', bidId);
      return res.status(404).json({ msg: 'Bid not found' });
    }

    console.log('Found trip:', trip._id);

    // Update the bid status to accepted
    const bid = trip.bids.id(bidId);
    if (!bid) {
      console.log('Bid not found in trip:', bidId);
      return res.status(404).json({ msg: 'Bid not found' });
    }

    bid.status = 'accepted';
    trip.status = 'booked';

    // Reject all other bids
    trip.bids.forEach(otherBid => {
      if (otherBid._id.toString() !== bidId) {
        otherBid.status = 'rejected';
      }
    });

    await trip.save();
    console.log('Bid accepted and trip updated:', trip._id);

    res.json({ msg: 'Bid accepted' });
  } catch (err) {
    console.error('Error accepting bid:', err);
    res.status(500).json({ msg: err.message });
  }
};

// Reject a bid (Traveler)
const rejectBid = async (req, res) => {
  try {
    await Bid.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ msg: 'Bid rejected' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Confirm payment for a bid (Traveler)
const confirmPayment = async (req, res) => {
  try {
    await Bid.findByIdAndUpdate(req.params.id, { paymentStatus: 'paid' });
    res.json({ msg: 'Payment confirmed and booking completed.' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Submit a rating for a completed booking (Traveler)
const rateBid = async (req, res) => {
  try {
    const { rating } = req.body;
    const bid = await Bid.findById(req.params.id);

    if (!bid) return res.status(404).json({ msg: 'Bid not found' });

    if (bid.paymentStatus !== 'paid')
      return res.status(400).json({ msg: 'You can only rate paid bookings' });

    bid.rating = rating;
    await bid.save();

    res.json({ msg: 'Rating submitted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all completed & paid bookings for current traveler
const getTravelerBookings = async (req, res) => {
  try {
    console.log('=== getTravelerBookings Debug ===');
    console.log('User ID:', req.user._id);
    
    // First, get all trips by this traveler
    const trips = await Trip.find({ traveler: req.user._id });
    console.log('Raw trips found:', JSON.stringify(trips, null, 2));

    if (trips.length === 0) {
      console.log('No trips found for this traveler');
      return res.json([]);
    }

    // Populate the trips with necessary data
    const populatedTrips = await Trip.find({ traveler: req.user._id })
      .populate('traveler', 'name')
      .populate('bids.agent', 'name');

    console.log('Populated trips:', JSON.stringify(populatedTrips, null, 2));

    // Get all accepted bids from these trips
    const acceptedBids = [];
    populatedTrips.forEach(trip => {
      console.log('Processing trip:', trip._id);
      console.log('Trip status:', trip.status);
      console.log('Trip bids:', JSON.stringify(trip.bids, null, 2));
      
      if (trip.bids && trip.bids.length > 0) {
        trip.bids.forEach(bid => {
          console.log('Processing bid:', JSON.stringify(bid, null, 2));
          // Include both accepted and paid bids
          if (bid.status === 'accepted' || bid.paymentStatus === 'paid') {
            console.log('Found accepted/paid bid:', JSON.stringify(bid, null, 2));
            acceptedBids.push({
              _id: bid._id,
              trip: {
                _id: trip._id,
                destination: trip.destination,
                startDate: trip.startDate,
                endDate: trip.endDate,
                traveler: trip.traveler
              },
              agent: bid.agent,
              price: bid.price,
              services: bid.services,
              status: bid.status,
              paymentStatus: bid.paymentStatus || 'pending',
              rating: bid.rating,
              createdAt: bid.createdAt
            });
          }
        });
      }
    });

    console.log('Final accepted bids:', JSON.stringify(acceptedBids, null, 2));
    res.json(acceptedBids);
  } catch (err) {
    console.error('Error in getTravelerBookings:', err);
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  submitBid,
  getBidsByTrip,
  acceptBid,
  rejectBid,
  confirmPayment,
  rateBid,
  getTravelerBookings
};
