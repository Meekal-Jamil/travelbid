const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

beforeAll(async () => {
  // Connect to a test database
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelbid-test');
  // Clear the users collection before tests
  await User.deleteMany({});
});

afterAll(async () => {
  // Close the database connection
  await mongoose.connection.close();
});

describe('Authentication Tests', () => {
  test('should register a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'traveler'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    if (response.status !== 201) {
      console.log('Registration failed:', response.body);
    }
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.role).toBe('traveler');
  });

  test('should not register with existing email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'password123',
        role: 'traveler'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });

  test('should login with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
}); 