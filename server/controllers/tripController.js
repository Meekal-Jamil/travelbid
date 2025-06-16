const Trip = require('../models/Trip');
const User = require('../models/User');

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const trip = new Trip({
      ...req.body,
      traveler: req.user._id,
      status: 'open'
    });
    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all trips based on user role
exports.getAllTrips = async (req, res) => {
  try {
    let trips;
    if (req.user.role === 'agent') {
      // Agents see all open trips
      trips = await Trip.find({ status: 'open' })
        .populate('traveler', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Travelers see their own trips
      trips = await Trip.find({ traveler: req.user._id })
        .populate('traveler', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single trip
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('traveler', 'name email')
      .populate('bids.agent', 'name email');
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user has permission to view this trip
    if (req.user.role === 'traveler' && trip.traveler._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this trip' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Place a bid on a trip
exports.placeBid = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'open') {
      return res.status(400).json({ message: 'This trip is no longer accepting bids' });
    }

    // Check if agent has already placed a bid
    const existingBid = trip.bids.find(bid => 
      bid.agent.toString() === req.user._id.toString()
    );

    if (existingBid) {
      return res.status(400).json({ message: 'You have already placed a bid on this trip' });
    }

    // Add new bid
    trip.bids.push({
      agent: req.user._id,
      price: req.body.price,
      services: req.body.services,
      status: 'pending'
    });

    // Update agent statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'stats.totalBids': 1,
        'stats.pendingBids': 1
      }
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle bid action (accept/reject)
exports.handleBidAction = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is the trip owner
    if (trip.traveler.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage bids for this trip' });
    }

    // Check if trip is still open
    if (trip.status !== 'open') {
      return res.status(400).json({ message: 'This trip is no longer accepting bid actions' });
    }

    const bid = trip.bids.id(req.params.bidId);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if bid is still pending
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'This bid has already been processed' });
    }

    if (req.body.action === 'accept') {
      // Update bid status
      bid.status = 'accepted';
      
      // Update trip status
      trip.status = 'booked';
      
      // Update agent statistics for accepted bid
      await User.findByIdAndUpdate(bid.agent, {
        $inc: {
          'stats.acceptedBids': 1,
          'stats.pendingBids': -1,
          'stats.totalEarnings': bid.price
        }
      });
      
      // Reject all other bids and update their agents' statistics
      for (const otherBid of trip.bids) {
        if (otherBid._id.toString() !== bid._id.toString()) {
          otherBid.status = 'rejected';
          // Update statistics for rejected bids
          await User.findByIdAndUpdate(otherBid.agent, {
            $inc: {
              'stats.rejectedBids': 1,
              'stats.pendingBids': -1
            }
          });
        }
      }
    } else if (req.body.action === 'reject') {
      bid.status = 'rejected';
      
      // Update agent statistics for rejected bid
      await User.findByIdAndUpdate(bid.agent, {
        $inc: {
          'stats.rejectedBids': 1,
          'stats.pendingBids': -1
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be either "accept" or "reject"' });
    }

    await trip.save();
    res.json(trip);
  } catch (error) {
    console.error('Error in handleBidAction:', error);
    res.status(500).json({ 
      message: 'Failed to process bid action',
      error: error.message 
    });
  }
};

// Search trips
exports.searchTrips = async (req, res) => {
  try {
    const { destination, startDate, endDate, minBudget, maxBudget } = req.query;
    const query = { status: 'open' };

    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }
    if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }
    if (minBudget) {
      query.budget = { ...query.budget, $gte: minBudget };
    }
    if (maxBudget) {
      query.budget = { ...query.budget, $lte: maxBudget };
    }

    const trips = await Trip.find(query)
      .populate('traveler', 'name email')
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
