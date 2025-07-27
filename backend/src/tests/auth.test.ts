import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/database';

describe('Authentication', () => {
  beforeAll(async () => {
    // Clean up any existing test users
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'test@example.com' },
          { username: 'testuser' },
          { email: 'different@example.com' },
          { email: 'user@example.com' }
        ]
      }
    });
  });

  beforeEach(async () => {
    // Clean up between tests to ensure fresh state - force multiple attempts
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await prisma.user.deleteMany({
          where: {
            OR: [
              { email: 'test@example.com' },
              { username: 'testuser' },
              { email: 'different@example.com' },
              { email: 'user@example.com' },
              { email: 'first@example.com' },
              { username: 'duplicatetest' }
            ]
          }
        });
        
        // Verify cleanup worked
        const remainingUsers = await prisma.user.count({
          where: {
            OR: [
              { email: 'test@example.com' },
              { username: 'testuser' },
              { email: 'different@example.com' },
              { email: 'user@example.com' },
              { email: 'first@example.com' },
              { username: 'duplicatetest' }
            ]
          }
        });
        
        if (remainingUsers === 0) break;
        
        if (attempt === 2) {
          console.warn(`Auth test cleanup incomplete: ${remainingUsers} users remaining`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        if (attempt === 2) {
          console.error('Auth test cleanup failed:', error);
        }
      }
    }
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'test@example.com' },
          { username: 'testuser' }
        ]
      }
    });
    await prisma.$disconnect();
  });

  describe('Registration', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not register user with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          // missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should not register user with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser3',
          email: 'test3@example.com',
          password: '123' // too short
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('6 characters');
    });

    it('should not register user with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser4',
          email: 'invalid-email',
          password: 'validpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('valid email');
    });

    it('should not register duplicate username', async () => {
      const uniqueId = Date.now();
      const username = `duplicatetest${uniqueId}`;
      
      // First, create a user
      const firstResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          email: `first${uniqueId}@example.com`,
          password: 'testpassword123'
        });

      expect(firstResponse.status).toBe(201);

      // Then immediately try to create another user with the same username but different email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username, // duplicate username
          email: `different${uniqueId}@example.com`, // different email
          password: 'testpassword123'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('Login', () => {
    it('should login with valid credentials (username)', async () => {
      // First create a user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword123'
        });

      // Then try to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should login with valid credentials (email)', async () => {
      // First create a user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword123'
        });

      // Then try to login with email
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@example.com', // using email
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'testpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should not login with empty credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '   ', // empty after trim
          password: '   '  // empty after trim
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('cannot be empty');
    });
  });

  describe('Protected routes', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create a fresh user for each test to avoid token/user mismatch
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword123'
        });

      // Get a valid token for this fresh user
      if (registerResponse.status === 201) {
        authToken = registerResponse.body.token;
      } else {
        // User might already exist, try to login
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'testuser',
            password: 'testpassword123'
          });
        authToken = loginResponse.body.token;
      }
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should not access protected route without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Authentication required');
    });

    it('should not access protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid authentication token');
    });

    it('should not access protected route with malformed header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid authentication format');
    });
  });
});

