const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import your Mongoose models
const User = require('./models/User');
const Trip = require('./models/Trip');
const Bid = require('./models/Bid'); // Import Bid model
const Message = require('./models/Message'); // Import Message model

// ⚠ Prevent accidental execution in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Never run seed script in production!');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      console.log('✅ MongoDB connected');

      // Clear previous data for all models
      await User.deleteMany();
      await Trip.deleteMany();
      await Bid.deleteMany(); // Clear Bid data
      await Message.deleteMany(); // Clear Message data
      console.log('🗑 Cleared previous data for User, Trip, Bid, and Message collections.');

      // Create dummy users
      const users = [
        {
          name: 'Ali Traveler',
          email: 'ali@travelbid.com',
          password: await bcrypt.hash('123456', 10), // Hash the password
          role: 'traveler'
        },
        {
          name: 'Raza Agent',
          email: 'raza@travelbid.com',
          password: await bcrypt.hash('123456', 10), // Hash the password
          role: 'agent',
          stats: { // Initialize agent stats as per your User model
            totalBids: 0,
            pendingBids: 0,
            acceptedBids: 0,
            rejectedBids: 0,
            totalEarnings: 0
          }
        },
        {
          name: 'Farah Traveler',
          email: 'farah@travelbid.com',
          password: await bcrypt.hash('password123', 10),
          role: 'traveler'
        },
        {
          name: 'Sara Agent',
          email: 'sara@travelbid.com',
          password: await bcrypt.hash('agentpass', 10),
          role: 'agent',
          stats: {
            totalBids: 0,
            pendingBids: 0,
            acceptedBids: 0,
            rejectedBids: 0,
            totalEarnings: 0
          }
        }
      ];

      const insertedUsers = await User.insertMany(users);
      console.log('✅ Dummy users added');

      // Find the traveler user
      const aliTraveler = insertedUsers.find(u => u.email === 'ali@travelbid.com');
      const farahTraveler = insertedUsers.find(u => u.email === 'farah@travelbid.com');
      const razaAgent = insertedUsers.find(u => u.email === 'raza@travelbid.com');

      // Create dummy trips
      const trips = [
        {
          title: 'Murree Getaway',
          traveler: aliTraveler._id,
          destination: 'Murree',
          startDate: new Date('2025-07-10T00:00:00Z'),
          endDate: new Date('2025-07-15T00:00:00Z'),
          budget: 20000,
          preferences: 'Hotel with mountain view, family-friendly activities',
          description: 'A relaxing trip to Murree with family, looking for good accommodation and local attractions.',
          status: 'open'
        },
        {
          title: 'Northern Areas Adventure',
          traveler: aliTraveler._id,
          destination: 'Hunza Valley',
          startDate: new Date('2025-08-01T00:00:00Z'),
          endDate: new Date('2025-08-10T00:00:00Z'),
          budget: 50000,
          preferences: 'Adventure activities, hiking, comfortable stay',
          description: 'An adventurous trip to explore the beautiful Hunza Valley, seeking guides and suitable accommodation.',
          status: 'open'
        },
        {
          title: 'Karachi Beach Escape',
          traveler: farahTraveler._id,
          destination: 'Karachi',
          startDate: new Date('2025-09-01T00:00:00Z'),
          endDate: new Date('2025-09-05T00:00:00Z'),
          budget: 15000,
          preferences: 'Beachfront hotel, seafood restaurants',
          description: 'A short relaxing trip to Karachi, mainly for beach and good food.',
          status: 'open'
        }
      ];

      const insertedTrips = await Trip.insertMany(trips);
      console.log('✅ Sample trips added');

      // Optional: Create a dummy bid for a trip
      if (razaAgent && insertedTrips.length > 0) {
        const firstTrip = insertedTrips[0]; // Get the first created trip (Murree Getaway)
        await Bid.create({
          trip: firstTrip._id,
          agent: razaAgent._id,
          price: 18000,
          services: 'Hotel booking, transport, local guide',
          status: 'pending',
          paymentStatus: 'unpaid',
          rating: null
        });
        console.log('✅ Sample bid added to the first trip');

        // Also update the bids array within the Trip document for the first trip
        firstTrip.bids.push({
          agent: razaAgent._id,
          price: 18000,
          services: 'Hotel booking, transport, local guide',
          status: 'pending'
        });
        await firstTrip.save(); // Save the updated trip document
        console.log('✅ Bid also added to the Trip document.');
      }

      // No dummy messages will be created, but the collection will be cleared.

    } catch (err) {
      console.error('❌ Seeding failed:', err.message);
    } finally {
      // Ensure the process exits cleanly
      mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
        process.exit();
      
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });