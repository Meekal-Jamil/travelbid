const User = require('../models/User');
const Trip = require('../models/Trip');

const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

const getAllTrips = async (req, res) => {
  const trips = await Trip.find().populate('traveler', 'name email');
  res.json(trips);
};

module.exports = { getAllUsers, getAllTrips };
