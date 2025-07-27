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

  beforeAll(async () => {
    prisma = await TestSetup.setupTestDatabase();
    stakeService = new StakeService(prisma);
    marketService = new MarketService(prisma);
  });

  beforeEach(async () => {
    await TestSetup.resetDatabase();
    testUser = await TestSetup.createTestUser({ provePoints: 1000 });
    testArticle = await TestSetup.createTestArticle();
    testMarket = await TestSetup.createTestMarket(testArticle.id);
  });

  afterAll(async () => {
    await TestSetup.teardown();
  });

  describe('createStake', () => {
    it('should create stake successfully with valid parameters', async () => {
      const stakeAmount = 100;
      const prediction = true;

      const stake = await stakeService.createStake(
        testUser.id,
        testMarket.id,
        prediction,
        stakeAmount
      );

      expect(stake).toBeDefined();
      expect(stake.userId).toBe(testUser.id);
      expect(stake.marketId).toBe(testMarket.id);
      expect(stake.prediction).toBe(prediction);
      expect(stake.stakeAmount).toBe(stakeAmount);

      // Verify user PP was deducted
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      expect(updatedUser.provePoints).toBe(testUser.provePoints - stakeAmount);
    });

    it('should fail when user has insufficient ProvePoints', async () => {
      const insufficientUser = await TestSetup.createTestUser({ 
        username: 'pooruser',
        email: 'poor@test.com',
        provePoints: 50 
      });
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

    it('should update market probabilities correctly', async () => {
      const initialMarket = await prisma.market.findUnique({
        where: { id: testMarket.id }
      });

      await stakeService.createStake(testUser.id, testMarket.id, true, 200);

      const updatedMarket = await prisma.market.findUnique({
        where: { id: testMarket.id }
      });

      expect(updatedMarket.probTrue).toBeGreaterThan(initialMarket.probTrue);
      expect(updatedMarket.probFalse).toBeLessThan(initialMarket.probFalse);
      expect(updatedMarket.probTrue + updatedMarket.probFalse).toBeCloseTo(1, 5);
    });
  });

  describe('getUserStakes', () => {
    it('should return user stakes correctly', async () => {
      // Create multiple stakes
      await stakeService.createStake(testUser.id, testMarket.id, true, 50);
      await stakeService.createStake(testUser.id, testMarket.id, false, 75);

      const stakes = await stakeService.getUserStakes(testUser.id);

      expect(stakes).toHaveLength(2);
      expect(stakes[0].userId).toBe(testUser.id);
      expect(stakes[1].userId).toBe(testUser.id);
    });

    it('should return empty array for user with no stakes', async () => {
      const stakes = await stakeService.getUserStakes(testUser.id);
      expect(stakes).toHaveLength(0);
    });
  });

  describe('resolveStake', () => {
    it('should resolve winning stake correctly', async () => {
      const stake = await stakeService.createStake(testUser.id, testMarket.id, true, 100);
      const initialPP = await prisma.user.findUnique({ where: { id: testUser.id } });

      await stakeService.resolveStake(stake.id, true); // Correct prediction

      const resolvedStake = await prisma.stake.findUnique({ where: { id: stake.id } });
      const finalUser = await prisma.user.findUnique({ where: { id: testUser.id } });

      expect(resolvedStake.resolved).toBe(true);
      expect(resolvedStake.payout).toBeGreaterThan(resolvedStake.stakeAmount);
      expect(finalUser.provePoints).toBeGreaterThan(initialPP.provePoints);
    });

    it('should resolve losing stake correctly', async () => {
      const stake = await stakeService.createStake(testUser.id, testMarket.id, true, 100);
      const initialPP = await prisma.user.findUnique({ where: { id: testUser.id } });

      await stakeService.resolveStake(stake.id, false); // Wrong prediction

      const resolvedStake = await prisma.stake.findUnique({ where: { id: stake.id } });
      const finalUser = await prisma.user.findUnique({ where: { id: testUser.id } });

      expect(resolvedStake.resolved).toBe(true);
      expect(resolvedStake.payout).toBe(0);
      expect(finalUser.provePoints).toBe(initialPP.provePoints); // No additional payout
    });
  });
});
