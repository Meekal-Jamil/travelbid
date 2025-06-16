const express = require('express');
const { createPaymentIntent, handleSuccessfulPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create payment intent
router.post('/create-intent', protect, createPaymentIntent);

// Handle successful payment
router.post('/success', protect, handleSuccessfulPayment);

module.exports = router; 