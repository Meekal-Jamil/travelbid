const stripe = require('../config/stripe');
const Trip = require('../models/Trip');

// Create a payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { bidId, tripId } = req.body;

    // Find the trip and bid
    const trip = await Trip.findOne({ 
      _id: tripId,
      'bids._id': bidId 
    });

    if (!trip) {
      return res.status(404).json({ msg: 'Trip or bid not found' });
    }

    const bid = trip.bids.id(bidId);
    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bid.price * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        tripId: tripId,
        bidId: bidId,
        userId: req.user._id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ msg: err.message });
  }
};

// Handle successful payment
const handleSuccessfulPayment = async (req, res) => {
  try {
    const { tripId, bidId } = req.body;

    // Find the trip and bid
    const trip = await Trip.findOne({ 
      _id: tripId,
      'bids._id': bidId 
    });

    if (!trip) {
      return res.status(404).json({ msg: 'Trip or bid not found' });
    }

    const bid = trip.bids.id(bidId);
    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    // Update bid status
    bid.status = 'accepted';
    bid.paymentStatus = 'paid';
    trip.status = 'booked';

    // Reject all other bids
    trip.bids.forEach(otherBid => {
      if (otherBid._id.toString() !== bidId) {
        otherBid.status = 'rejected';
      }
    });

    await trip.save();

    res.json({ msg: 'Payment successful and bid accepted' });
  } catch (err) {
    console.error('Error handling successful payment:', err);
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  handleSuccessfulPayment
}; 