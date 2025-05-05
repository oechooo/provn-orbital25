// src/__tests__/user.test.ts
import request from 'supertest';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, username: 'testuser', email: 'test@example.com' }
      ]),
      findUnique: jest.fn().mockResolvedValue({
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com'
      }),
      create: jest.fn().mockImplementation((data) => Promise.resolve({
        id: 1,
        ...data.data
      })),
      update: jest.fn().mockImplementation((data) => Promise.resolve({
        id: data.where.id,
        ...data.data
      })),
      delete: jest.fn().mockResolvedValue({ id: 1 })
    },
    $connect: jest.fn(),
    $disconnect: jest.fn()
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Import app after mocking
import { app } from '../app';

// Basic test that doesn't depend on actual Prisma initialization
describe('User API', () => {
  it('should fetch all users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
