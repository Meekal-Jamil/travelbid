const Trip = require('../models/Trip');

const createTrip = async (req, res) => {
  try {
    const newTrip = await Trip.create({ ...req.body, traveler: req.user._id });
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate('traveler', 'name email');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { createTrip, getAllTrips };
