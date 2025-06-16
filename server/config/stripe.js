const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51OvXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: Using default test Stripe key. Please set STRIPE_SECRET_KEY in your .env file for production.');
}

module.exports = stripe; 