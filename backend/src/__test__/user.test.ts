// src/__tests__/user.test.ts
import request from 'supertest';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findMany: jest.fn().mockImplementation(({ select }) => Promise.resolve([
        { 
          id: 1, 
          username: 'testuser', 
          email: 'test@example.com', 
          ...(select?.createdAt && { createdAt: new Date() }),
          ...(select?.updatedAt && { updatedAt: new Date() })
        }
      ])),
      findUnique: jest.fn().mockImplementation(({ where, select }) => {
        if (where.id === 999) return Promise.resolve(null);
        return Promise.resolve({
          id: where.id || 1, 
          username: 'testuser', 
          email: 'test@example.com',
          ...(select?.createdAt && { createdAt: new Date() }),
          ...(select?.updatedAt && { updatedAt: new Date() }),
          ...(select?.password && { password: 'hashedpassword' }) // Only include if selected
        });
      }),
      create: jest.fn().mockImplementation(({ data, select }) => {
        // Create an object with all data first
        const fullUser: Record<string, any> = {
          id: 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // If select is provided, only return selected fields
        if (select) {
          return Promise.resolve(
            Object.keys(select)
              .filter(key => select[key] === true)
              .reduce((obj: Record<string, any>, key) => {
                obj[key] = fullUser[key];
                return obj;
              }, {})
          );
        }
        
        return Promise.resolve(fullUser);
      }),
      update: jest.fn().mockImplementation(({ where, data, select }) => {
        if (where.id === 999) throw new Error('User not found');
        
        // Create an object with all data first
        const fullUser: Record<string, any> = {
          id: where.id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // If select is provided, only return selected fields
        if (select) {
          return Promise.resolve(
            Object.keys(select)
              .filter(key => select[key] === true)
              .reduce((obj: Record<string, any>, key) => {
                obj[key] = fullUser[key];
                return obj;
              }, {})
          );
        }
        
        return Promise.resolve(fullUser);
      }),
      delete: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 999) throw new Error('User not found');
        return Promise.resolve({ id: where.id });
      })
    },
    $connect: jest.fn(),
    $disconnect: jest.fn()
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock PrismaClientKnownRequestError for unique constraint violation tests
jest.mock('@prisma/client/runtime/library', () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, { code }: { code: string }) {
      super(message);
      this.name = 'PrismaClientKnownRequestError';
      this.code = code;
    }
  }
  
  return { PrismaClientKnownRequestError };
});

// Import app after mocking
import { app } from '../app';

describe('User API', () => {
  // GET all users
  describe('GET /api/users', () => {
    it('should fetch all users successfully', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty('username', 'testuser');
    });
  });

  // GET user by ID
  describe('GET /api/users/:id', () => {
    it('should fetch a user by ID successfully', async () => {
      const response = await request(app).get('/api/users/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/users/invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid ID format');
    });
  });

  // POST create user
  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', userData.username);
      expect(response.body).toHaveProperty('email', userData.email);
      // Password should not be included in response
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ username: 'incomplete' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle duplicate username/email', async () => {
      // Mock the create method to throw a unique constraint error
      const prismaClient = require('@prisma/client');
      const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
      
      const mockCreate = jest.fn().mockRejectedValue(
        new PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002' })
      );
      
      // Override the mock
      prismaClient.PrismaClient().user.create = mockCreate;

      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'existing',
          email: 'existing@example.com',
          password: 'password'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Username or email already exists');
    });
  });

  // PUT update user
  describe('PUT /api/users/:id', () => {
    it('should update a user successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/users/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('username', updateData.username);
      expect(response.body).toHaveProperty('email', updateData.email);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/999')
        .send({ username: 'nonexistent' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .put('/api/users/invalid')
        .send({ username: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid ID format');
    });
  });

  // DELETE user
  describe('DELETE /api/users/:id', () => {
    it('should delete a user successfully', async () => {
      const response = await request(app).delete('/api/users/1');
      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).delete('/api/users/999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).delete('/api/users/invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid ID format');
    });
  });
});
