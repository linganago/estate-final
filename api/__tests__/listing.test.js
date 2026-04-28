process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.js';

let mongoServer;
let authCookie;
let userId;

const testListing = {
  name: 'Beautiful Test Home',
  description: 'A lovely home for testing purposes',
  address: '123 Test Street, Test City, TC 12345',
  regularPrice: 250000,
  discountPrice: 230000,
  bathrooms: 2,
  bedrooms: 3,
  furnished: true,
  parking: true,
  type: 'sale',
  offer: true,
  imageUrls: ['https://example.com/image1.jpg'],
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create and sign in a user to get auth cookie
  await request(app).post('/api/auth/signup').send({
    username: 'listinguser',
    email: 'listing@example.com',
    password: 'password123',
  });

  const signinRes = await request(app).post('/api/auth/signin').send({
    email: 'listing@example.com',
    password: 'password123',
  });

  authCookie = signinRes.headers['set-cookie'];
  userId = signinRes.body._id;
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 10000);

describe('POST /api/listing/create', () => {
  it('creates a listing when authenticated', async () => {
    const res = await request(app)
      .post('/api/listing/create')
      .set('Cookie', authCookie)
      .send({ ...testListing, userRef: userId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.listing.name).toBe(testListing.name);
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/listing/create')
      .send({ ...testListing, userRef: userId });
    expect(res.status).toBe(401);
  });

  it('rejects invalid listing data with 400', async () => {
    const res = await request(app)
      .post('/api/listing/create')
      .set('Cookie', authCookie)
      .send({ name: 'x', userRef: userId }); // too short name, missing fields
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/listing/get', () => {
  it('returns listings array', async () => {
    const res = await request(app).get('/api/listing/get');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('supports type filter', async () => {
    const res = await request(app).get('/api/listing/get?type=sale');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('supports search term', async () => {
    // Create a listing first
    await request(app)
      .post('/api/listing/create')
      .set('Cookie', authCookie)
      .send({ ...testListing, name: 'Unique Searchable Property', userRef: userId });

    const res = await request(app).get('/api/listing/get?searchTerm=Searchable');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
