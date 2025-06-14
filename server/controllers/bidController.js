const Bid = require('../models/Bid');

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
    await Bid.findByIdAndUpdate(req.params.id, { status: 'accepted' });
    res.json({ msg: 'Bid accepted' });
  } catch (err) {
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
    const bids = await Bid.find({
      paymentStatus: 'paid'
    }).populate('trip').populate('agent', 'name');

    // Filter by traveler ID
    const filtered = bids.filter(b => b.trip.traveler.toString() === req.user._id.toString());
    res.json(filtered);
  } catch (err) {
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
