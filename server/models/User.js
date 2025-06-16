const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String, 
    unique: true,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._%+-]+@travelbid\.com$/.test(v);
      },
      message: props => `${props.value} is not a valid email! Email must end with @travelbid.com`
    }
  },
  password: String,
  role: { type: String, enum: ['traveler', 'agent'] },
  // Statistics for agents
  stats: {
    totalBids: { type: Number, default: 0 },
    pendingBids: { type: Number, default: 0 },
    acceptedBids: { type: Number, default: 0 },
    rejectedBids: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  }
});
module.exports = mongoose.model('User', userSchema);
