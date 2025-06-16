const stripe = require('../config/stripe');
const Trip = require('../models/Trip');
const User = require('../models/User');

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
    console.log('Handling successful payment for trip:', tripId, 'bid:', bidId);

    // Find the trip and bid
    const trip = await Trip.findOne({ 
      _id: tripId,
      'bids._id': bidId 
    });

    if (!trip) {
      console.log('Trip or bid not found');
      return res.status(404).json({ msg: 'Trip or bid not found' });
    }

    const bid = trip.bids.id(bidId);
    if (!bid) {
      console.log('Bid not found in trip');
      return res.status(404).json({ msg: 'Bid not found' });
    }

    console.log('Current bid status:', bid.status);
    console.log('Current payment status:', bid.paymentStatus);

    // Update bid status and payment status
    bid.status = 'accepted';
    bid.paymentStatus = 'paid';
    trip.status = 'booked';

    console.log('Updated bid status:', bid.status);
    console.log('Updated payment status:', bid.paymentStatus);

    // Update agent statistics for accepted bid
    const agentUpdate = await User.findByIdAndUpdate(
      bid.agent,
      {
        $inc: {
          'stats.acceptedBids': 1,
          'stats.pendingBids': -1,
          'stats.totalEarnings': bid.price
        }
      },
      { new: true }
    );
    console.log('Updated agent stats after payment:', agentUpdate.stats);

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

    // Save the trip with the updated bid
    await trip.save();
    console.log('Payment successful and bid accepted. Trip saved with payment status:', bid.paymentStatus);

    // Verify the payment status was saved
    const savedTrip = await Trip.findById(tripId);
    const savedBid = savedTrip.bids.id(bidId);
    console.log('Verified saved payment status:', savedBid.paymentStatus);

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