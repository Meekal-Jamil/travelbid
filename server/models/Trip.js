const mongoose = require('mongoose');
const tripSchema = new mongoose.Schema({
  traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  destination: String,
  startDate: Date,
  endDate: Date,
  budget: Number,
  preferences: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Trip', tripSchema);
