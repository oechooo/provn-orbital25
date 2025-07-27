import { StakeService } from '../../services/StakeService';
import { MarketService } from '../../services/MarketService';
import { TestSetup } from '../setup/testSetup';

describe('StakeService Unit Tests', () => {
  let prisma: any;
  let stakeService: StakeService;
  let marketService: MarketService;
  let testUser: any;
  let testArticle: any;
  let testMarket: any;
  const testInstanceKey = 'stakeServiceUnit';

  beforeAll(async () => {
    prisma = await TestSetup.setupTestDatabase(testInstanceKey);
    stakeService = new StakeService(prisma);
    marketService = new MarketService(prisma);
  });

  beforeEach(async () => {
    await TestSetup.resetDatabase(testInstanceKey);
    testUser = await TestSetup.createTestUser({ provePoints: 1000 }, testInstanceKey);
    testArticle = await TestSetup.createTestArticle({}, testInstanceKey);
    testMarket = await TestSetup.createTestMarket(testArticle.id, {}, testInstanceKey);
  });

  afterAll(async () => {
    await TestSetup.teardown(testInstanceKey);
  });

  describe('createStake', () => {
    it('should fail when user has insufficient ProvePoints', async () => {
      const insufficientUser = await TestSetup.createTestUser({ 
        username: 'pooruser',
        email: 'poor@test.com',
        provePoints: 50 
      }, testInstanceKey);
      const stakeAmount = 100;

      await expect(
        stakeService.createStake(insufficientUser.id, testMarket.id, true, stakeAmount)
      ).rejects.toThrow('Insufficient prove points');
    });

    it('should fail with invalid market ID', async () => {
      await expect(
        stakeService.createStake(testUser.id, 99999, true, 100)
      ).rejects.toThrow();
    });

    it('should fail with zero or negative stake amount', async () => {
      await expect(
        stakeService.createStake(testUser.id, testMarket.id, true, 0)
      ).rejects.toThrow();

      await expect(
        stakeService.createStake(testUser.id, testMarket.id, true, -50)
      ).rejects.toThrow();
    });
  });

  describe('getUserStakes', () => {
    it('should return empty array for user with no stakes', async () => {
      const stakes = await stakeService.getUserStakes(testUser.id);
      expect(stakes).toHaveLength(0);
    });
  });

  describe('resolveStake', () => {
    it('should resolve losing stake correctly', async () => {
      const stake = await stakeService.createStake(testUser.id, testMarket.id, true, 100);
      const initialPP = await prisma.user.findUnique({ where: { id: testUser.id } });

      await stakeService.resolveStake(stake.id, false); // Wrong prediction

      const resolvedStake = await prisma.stake.findUnique({ where: { id: stake.id } });
      const finalUser = await prisma.user.findUnique({ where: { id: testUser.id } });

      expect(resolvedStake?.resolved).toBe(true);
      expect(resolvedStake?.won).toBe(false);
      expect(finalUser?.provePoints).toBe(initialPP?.provePoints); // No additional payout
    });
  });
});
