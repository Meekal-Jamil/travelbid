const Trip = require('../models/Trip');

// ✅ Create a new trip (Traveler)
const createTrip = async (req, res) => {
  try {
    const newTrip = await Trip.create({ ...req.body, traveler: req.user._id });
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Get trips based on user role
const getAllTrips = async (req, res) => {
  try {
    let trips;

    // If the user is an agent, show all trips
    if (req.user.role === 'agent') {
      trips = await Trip.find().populate('traveler', 'name email');
    } else {
      // If the user is a traveler, show only their trips
      trips = await Trip.find({ traveler: req.user._id }).populate('traveler', 'name email');
    }

    res.json(trips);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { createTrip, getAllTrips };
