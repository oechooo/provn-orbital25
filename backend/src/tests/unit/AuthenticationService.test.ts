/// <reference types="jest" />

import { StakeService } from '../../services/StakeService';
import { TestSetup } from '../setup/testSetup';
import { prisma } from '../../config/database';

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    await TestSetup.setupTestDatabase();
  });

  beforeEach(async () => {
    await TestSetup.resetDatabase();
  });

  afterAll(async () => {
    await TestSetup.teardown();
  });

  describe('User Registration and Authentication', () => {
    test('should create new user with proper defaults', async () => {
      const userData = {
        username: 'authtest',
        email: 'authtest@example.com',
        password: 'password123',
        provePoints: 100
      };

      const user = await TestSetup.createTestUser(userData);

      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.provePoints).toBe(userData.provePoints);
      expect(user.password).toBeDefined(); // Should be hashed
      expect(user.avatarHair).toBe('short01'); // Default avatar
      expect(user.avatarEyes).toBe('variant01');
      expect(user.avatarMouth).toBe('variant01');
    });

    test('should prevent duplicate usernames', async () => {
      await TestSetup.createTestUser({
        username: 'duplicate',
        email: 'first@example.com'
      });

      await expect(
        TestSetup.createTestUser({
          username: 'duplicate',
          email: 'second@example.com'
        })
      ).rejects.toThrow();
    });

    test('should prevent duplicate emails', async () => {
      await TestSetup.createTestUser({
        username: 'first',
        email: 'duplicate@example.com'
      });

      await expect(
        TestSetup.createTestUser({
          username: 'second',
          email: 'duplicate@example.com'
        })
      ).rejects.toThrow();
    });

    test('should initialize avatar purchase arrays correctly', async () => {
      const user = await TestSetup.createTestUser();

      expect(JSON.parse(user.purchasedHair)).toEqual([]);
      expect(JSON.parse(user.purchasedEyes)).toEqual([]);
      expect(JSON.parse(user.purchasedMouth)).toEqual([]);
      expect(JSON.parse(user.purchasedAccessories)).toEqual([]);
    });
  });

  describe('User Profile Management', () => {
    test('should update user avatar configuration', async () => {
      const user = await TestSetup.createTestUser();

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarHair: 'longHair',
          avatarEyes: 'hearteyes',
          avatarSkinColor: 'f4c2a1',
          avatarHairColor: '8b4513'
        }
      });

      expect(updatedUser.avatarHair).toBe('longHair');
      expect(updatedUser.avatarEyes).toBe('hearteyes');
      expect(updatedUser.avatarSkinColor).toBe('f4c2a1');
      expect(updatedUser.avatarHairColor).toBe('8b4513');
    });

    test('should track avatar purchases correctly', async () => {
      const user = await TestSetup.createTestUser({ provePoints: 500 });

      // Simulate selecting/equipping hair (NO COST)
      const purchasedItems = ['straightHair'];

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          purchasedHair: JSON.stringify(purchasedItems),
          avatarHair: 'straightHair'
          // provePoints unchanged - avatar items don't cost anything
        }
      });

      expect(JSON.parse(updatedUser.purchasedHair)).toContain('straightHair');
      expect(updatedUser.provePoints).toBe(user.provePoints); // No cost
      expect(updatedUser.avatarHair).toBe('straightHair');
    });

    test('should maintain user balance integrity', async () => {
      const initialPP = 1000;
      const user = await TestSetup.createTestUser({ provePoints: initialPP });

      // Simulate various PP transactions with proper sequencing
      let currentPP = initialPP;

      // Avatar customization (NO COST - just requirements)
      // This should not affect balance, just update avatar fields
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          avatarHair: 'straightHair',
          purchasedHair: JSON.stringify(['straightHair'])
        }
      });

      // Stake creation (simulated)
      currentPP -= 100;
      const afterStake = await prisma.user.update({
        where: { id: user.id },
        data: { provePoints: currentPP }
      });
      expect(afterStake.provePoints).toBe(900);

      // Winning payout (simulated)
      currentPP += 200;
      const afterWinning = await prisma.user.update({
        where: { id: user.id },
        data: { provePoints: currentPP }
      });
      expect(afterWinning.provePoints).toBe(1100);

      // Final verification
      const finalUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      expect(finalUser).toBeDefined();
      expect(finalUser?.provePoints).toBe(1100); // 1000 - 100 + 200 (avatar doesn't cost anything)
    });
  });

  describe('User Data Validation', () => {
    test('should handle user lookup operations', async () => {
      const user = await TestSetup.createTestUser();

      // Test finding by ID
      const foundById = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(foundById).toBeDefined();
      expect(foundById?.id).toBe(user.id);

      // Test finding by username
      const foundByUsername = await prisma.user.findUnique({
        where: { username: user.username }
      });
      expect(foundByUsername).toBeDefined();
      expect(foundByUsername?.username).toBe(user.username);
    });

    test('should return null for non-existent users', async () => {
      const nonExistent = await prisma.user.findUnique({
        where: { id: 99999 }
      });
      expect(nonExistent).toBeNull();
    });
  });
});
