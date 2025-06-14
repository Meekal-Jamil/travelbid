const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip'); // Optional: only if you're seeding trips
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ⚠️ Prevent accidental execution in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Never run seed script in production!');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      console.log('✅ MongoDB connected');

      // Clear previous users
      await User.deleteMany();
      await Trip.deleteMany(); // Optional: remove this if not seeding trips

      // Create dummy users
      const users = [
        {
          name: 'Ali Traveler',
          email: 'ali@travelbid.com',
          password: await bcrypt.hash('123456', 10),
          role: 'traveler'
        },
        {
          name: 'Raza Agent',
          email: 'raza@travelbid.com',
          password: await bcrypt.hash('123456', 10),
          role: 'agent'
        }
      ];

      const insertedUsers = await User.insertMany(users);
      console.log('✅ Dummy users added');

      // Optional: Create a dummy trip for Ali Traveler
      const traveler = insertedUsers.find(u => u.role === 'traveler');

      await Trip.create({
        traveler: traveler._id,
        destination: 'Murree',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        budget: 20000,
        preferences: 'Hotel with mountain view'
      });

      console.log('✅ Sample trip added');

    } catch (err) {
      console.error('❌ Seeding failed:', err.message);
    } finally {
      process.exit();
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
