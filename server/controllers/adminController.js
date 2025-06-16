const User = require('../models/User');
const Trip = require('../models/Trip');
const Bid = require('../models/Bid');

// Get all users (Admin)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all trips (Admin)
const getAllTrips = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const trips = await Trip.find()
      .populate('traveler', 'name email')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get agent statistics
const getAgentStats = async (req, res) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const totalBids = await Bid.countDocuments({ agent: req.user._id });
    const acceptedBids = await Bid.countDocuments({ 
      agent: req.user._id,
      status: 'accepted'
    });
    const pendingBids = await Bid.countDocuments({ 
      agent: req.user._id,
      status: 'pending'
    });

    // Calculate total earnings from accepted bids
    const acceptedBidsList = await Bid.find({ 
      agent: req.user._id,
      status: 'accepted'
    }).populate('trip', 'budget');

    const totalEarnings = acceptedBidsList.reduce((sum, bid) => {
      return sum + (bid.trip.budget * 0.1); // 10% commission
    }, 0);

    res.json({
      totalBids,
      acceptedBids,
      pendingBids,
      totalEarnings
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const pendingBids = await Bid.countDocuments({ status: 'pending' });
    const acceptedBids = await Bid.countDocuments({ status: 'accepted' });

    // Calculate total earnings from accepted bids
    const acceptedBidsList = await Bid.find({ status: 'accepted' })
      .populate('trip', 'budget');

    const totalEarnings = acceptedBidsList.reduce((sum, bid) => {
      return sum + (bid.trip.budget * 0.1); // 10% commission
    }, 0);

    res.json({
      totalUsers,
      totalTrips,
      pendingBids,
      acceptedBids,
      totalEarnings
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getAllUsers,
  getAllTrips,
  getAgentStats,
  getAdminStats
};
