const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

let authToken;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelbid-test');
  
  // First register a user
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'traveler'
    });

  // Then login to get auth token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });
  
  authToken = loginResponse.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Trip Tests', () => {
  test('should create a new trip', async () => {
    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Summer Vacation',
        destination: 'Paris',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        budget: 2000,
        preferences: 'Luxury hotel, guided tours',
        description: 'Summer vacation in Paris'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.destination).toBe('Paris');
    expect(response.body.status).toBe('open');
  });

  test('should get all trips for traveler', async () => {
    const response = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('should not create trip without authentication', async () => {
    const response = await request(app)
      .post('/api/trips')
      .send({
        title: 'Summer Vacation',
        destination: 'London',
        startDate: '2024-07-01',
        endDate: '2024-07-07',
        budget: 2500,
        preferences: 'Budget hotel, self-guided tours',
        description: 'Summer vacation in London'
      });
    
    expect(response.status).toBe(401);
  });
}); 