

// Must mock BEFORE importing app - set env vars
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 10000);

afterEach(async () => {
  // Clean up collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('POST /api/auth/signup', () => {
  it('creates a new user and returns 201', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/successfully/i);
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/signup').send({
      username: 'user1',
      email: 'dup@example.com',
      password: 'pass123',
    });
    const res = await request(app).post('/api/auth/signup').send({
      username: 'user2',
      email: 'dup@example.com',
      password: 'pass123',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/signin', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/signup').send({
      username: 'signinuser',
      email: 'signin@example.com',
      password: 'password123',
    });
  });

  it('returns 200 and sets access_token cookie on valid credentials', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: 'signin@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/access_token/);
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: 'signin@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-existent user with 404', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: 'ghost@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/auth/signout', () => {
  it('clears cookie and returns 200', async () => {
    const res = await request(app).get('/api/auth/signout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
