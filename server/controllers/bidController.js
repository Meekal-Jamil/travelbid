const Bid = require('../models/Bid');
const Trip = require('../models/Trip');
const User = require('../models/User');

// Helper function to update agent stats
const updateAgentStats = async (agentId, updates) => {
  try {
    const agent = await User.findById(agentId);
    if (!agent) return;

    // Initialize stats if they don't exist
    if (!agent.stats) {
      agent.stats = {
        totalBids: 0,
        acceptedBids: 0,
        rejectedBids: 0,
        pendingBids: 0,
        totalEarnings: 0
      };
    }

    // Apply updates
    Object.assign(agent.stats, updates);
    await agent.save();
  } catch (err) {
    console.error('Error updating agent stats:', err);
  }
};

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

    // Update agent stats for new bid
    await updateAgentStats(req.user._id, {
      totalBids: (req.user.stats?.totalBids || 0) + 1,
      pendingBids: (req.user.stats?.pendingBids || 0) + 1
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

    // Update stats for accepted bid
    await updateAgentStats(bid.agent, {
      acceptedBids: (req.user.stats?.acceptedBids || 0) + 1,
      pendingBids: (req.user.stats?.pendingBids || 0) - 1
    });

    // Update stats for rejected bids
    const rejectedBids = trip.bids.filter(b => b.status === 'rejected');
    for (const rejectedBid of rejectedBids) {
      await updateAgentStats(rejectedBid.agent, {
        rejectedBids: (req.user.stats?.rejectedBids || 0) + 1,
        pendingBids: (req.user.stats?.pendingBids || 0) - 1
      });
    }

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
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    bid.status = 'rejected';
    await bid.save();

    // Update agent stats for rejected bid
    await updateAgentStats(bid.agent, {
      rejectedBids: (req.user.stats?.rejectedBids || 0) + 1,
      pendingBids: (req.user.stats?.pendingBids || 0) - 1
    });

    res.json({ msg: 'Bid rejected' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Confirm payment for a bid (Traveler)
const confirmPayment = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    bid.paymentStatus = 'paid';
    await bid.save();

    // Update agent stats for payment
    const commission = bid.price * 0.1; // 10% commission
    await updateAgentStats(bid.agent, {
      totalEarnings: (req.user.stats?.totalEarnings || 0) + commission
    });

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
