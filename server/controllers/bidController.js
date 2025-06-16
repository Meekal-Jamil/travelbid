const Bid = require('../models/Bid');
const Trip = require('../models/Trip');
const User = require('../models/User');

// Submit a bid (Agent)
const submitBid = async (req, res) => {
  try {
    const { trip, price, services } = req.body;
    
    // Create the bid
    const newBid = await Bid.create({
      trip,
      agent: req.user._id,
      price,
      services
    });

    // Update agent statistics
    const agentUpdate = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          'stats.totalBids': 1,
          'stats.pendingBids': 1
        }
      },
      { new: true }
    );
    console.log('Updated agent stats after bid submission:', agentUpdate.stats);

    res.status(201).json(newBid);
  } catch (err) {
    console.error('Error submitting bid:', err);
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

    // Update the bid status to accepted
    const bid = trip.bids.id(bidId);
    if (!bid) {
      console.log('Bid not found in trip:', bidId);
      return res.status(404).json({ msg: 'Bid not found' });
    }

    // Update bid status
    bid.status = 'accepted';
    trip.status = 'booked';

    // Update agent statistics for accepted bid
    const agentUpdate = await User.findByIdAndUpdate(
      bid.agent,
      {
        $inc: {
          'stats.acceptedBids': 1,
          'stats.pendingBids': -1
        }
      },
      { new: true }
    );
    console.log('Updated agent stats after bid acceptance:', agentUpdate.stats);

    // Reject all other bids and update their agents' statistics
    for (const otherBid of trip.bids) {
      if (otherBid._id.toString() !== bidId) {
        otherBid.status = 'rejected';
        // Update statistics for rejected bids
        await User.findByIdAndUpdate(
          otherBid.agent,
          {
            $inc: {
              'stats.rejectedBids': 1,
              'stats.pendingBids': -1
            }
          },
          { new: true }
        );
      }
    }

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
    const bidId = req.params.id;
    
    // Find the trip that contains this bid
    const trip = await Trip.findOne({ 'bids._id': bidId });
    if (!trip) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    const bid = trip.bids.id(bidId);
    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    // Update bid status
    bid.status = 'rejected';

    // Update agent statistics
    const agentUpdate = await User.findByIdAndUpdate(
      bid.agent,
      {
        $inc: {
          'stats.rejectedBids': 1,
          'stats.pendingBids': -1
        }
      },
      { new: true }
    );
    console.log('Updated agent stats after bid rejection:', agentUpdate.stats);

    await trip.save();
    res.json({ msg: 'Bid rejected' });
  } catch (err) {
    console.error('Error rejecting bid:', err);
    res.status(500).json({ msg: err.message });
  }
};

// Confirm payment for a bid (Traveler)
const confirmPayment = async (req, res) => {
  try {
    const bidId = req.params.id;
    
    // Find the trip that contains this bid
    const trip = await Trip.findOne({ 'bids._id': bidId });
    if (!trip) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    const bid = trip.bids.id(bidId);
    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    // Update bid payment status
    bid.paymentStatus = 'paid';

    // Update agent statistics for payment
    const agentUpdate = await User.findByIdAndUpdate(
      bid.agent,
      {
        $inc: {
          'stats.totalEarnings': bid.price
        }
      },
      { new: true }
    );
    console.log('Updated agent earnings after payment:', agentUpdate.stats.totalEarnings);

    await trip.save();
    res.json({ msg: 'Payment confirmed and booking completed.' });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ msg: err.message });
  }
};

// Submit a rating for a completed booking (Traveler)
const rateBid = async (req, res) => {
  try {
    const { rating } = req.body;
    const bidId = req.params.id;
    console.log('Rating bid:', bidId, 'with rating:', rating);

    // Find the trip that contains this bid
    const trip = await Trip.findOne({ 'bids._id': bidId });
    if (!trip) {
      console.log('Trip not found for bid:', bidId);
      return res.status(404).json({ msg: 'Bid not found' });
    }

    const bid = trip.bids.id(bidId);
    if (!bid) {
      console.log('Bid not found in trip:', bidId);
      return res.status(404).json({ msg: 'Bid not found' });
    }

    console.log('Current bid status:', bid.status);
    console.log('Current payment status:', bid.paymentStatus);

    if (bid.paymentStatus !== 'paid') {
      console.log('Cannot rate unpaid booking');
      return res.status(400).json({ msg: 'You can only rate paid bookings' });
    }

    // Update the rating
    bid.rating = rating;
    await trip.save();
    console.log('Rating updated successfully');

    res.json({ msg: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Error submitting rating:', err);
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
          // Only include accepted bids
          if (bid.status === 'accepted') {
            console.log('Found accepted bid:', JSON.stringify(bid, null, 2));
            const bidData = {
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
              paymentStatus: bid.paymentStatus || 'unpaid',
              rating: bid.rating,
              createdAt: bid.createdAt
            };
            console.log('Created bid data with payment status:', bidData.paymentStatus);
            acceptedBids.push(bidData);
          }
        });
      }
    });

    // Sort bids by creation date, newest first
    acceptedBids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('Final accepted bids with payment statuses:', JSON.stringify(acceptedBids.map(bid => ({
      id: bid._id,
      status: bid.status,
      paymentStatus: bid.paymentStatus
    })), null, 2));

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
