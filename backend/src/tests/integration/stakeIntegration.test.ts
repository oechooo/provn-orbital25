import { TestSetup } from '../setup/testSetup';
import { StakeService } from '../../services/StakeService';
import { MarketService } from '../../services/MarketService';
import { UserService } from '../../services/UserService';

describe('Stake Integration Tests', () => {
  let prisma: any;
  let stakeService: StakeService;
  let marketService: MarketService;
  let userService: UserService;
  let testUser: any;
  let testArticle: any;
  let testMarket: any;

  beforeAll(async () => {
    prisma = await TestSetup.setupTestDatabase();
    stakeService = new StakeService(prisma);
    marketService = new MarketService(prisma);
    userService = new UserService(prisma);
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

  describe('Complete Stake Flow Integration', () => {
    test('should create stake and update market probabilities correctly', async () => {
      const stakeAmount = 100;
      const prediction = true;

      // Get initial market state
      const initialMarket = await prisma.market.findUnique({
        where: { id: testMarket.id }
      });

      // Get staking parameters
      const stakingParams = await marketService.getStakingParameters(
        testMarket.id,
        prediction,
        stakeAmount
      );

      expect(stakingParams).toHaveProperty('upside');
      expect(stakingParams).toHaveProperty('sharesBought');
      expect(stakingParams.upside).toBeGreaterThan(0);

      // Create stake
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

      // Verify user PP deduction
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      expect(updatedUser.provePoints).toBe(testUser.provePoints - stakeAmount);

      // Verify market probability update
      const updatedMarket = await prisma.market.findUnique({
        where: { id: testMarket.id }
      });

      if (prediction) {
        expect(updatedMarket.probTrue).toBeGreaterThan(initialMarket.probTrue);
        expect(updatedMarket.probFalse).toBeLessThan(initialMarket.probFalse);
      } else {
        expect(updatedMarket.probFalse).toBeGreaterThan(initialMarket.probFalse);
        expect(updatedMarket.probTrue).toBeLessThan(initialMarket.probTrue);
      }

      // Verify probability sum equals 1
      expect(updatedMarket.probTrue + updatedMarket.probFalse).toBeCloseTo(1, 5);
    });

    test('should handle multiple stakes on same market correctly', async () => {
      // User 1 stakes TRUE
      await stakeService.createStake(testUser.id, testMarket.id, true, 100);

      // Create second user
      const user2 = await TestSetup.createTestUser({
        provePoints: 500
      });

      // User 2 stakes FALSE
      await stakeService.createStake(user2.id, testMarket.id, false, 150);

      // Check market state
      const finalMarket = await prisma.market.findUnique({
        where: { id: testMarket.id },
        include: { stakes: true }
      });

      expect(finalMarket.stakes).toHaveLength(2);
      expect(finalMarket.sharesTrue).toBeGreaterThan(0);
      expect(finalMarket.sharesFalse).toBeGreaterThan(0);
      expect(finalMarket.probTrue + finalMarket.probFalse).toBeCloseTo(1, 5);
    });

    test('should prevent stakes with insufficient ProvePoints', async () => {
      const poorUser = await TestSetup.createTestUser({
        provePoints: 50
      });

      await expect(
        stakeService.createStake(poorUser.id, testMarket.id, true, 100)
      ).rejects.toThrow('Insufficient prove points');
    });

    test('should calculate upside correctly based on market probabilities', async () => {
      // Market starts at 50/50, so upside should be around 2x for either side
      const stakingParams = await marketService.getStakingParameters(
        testMarket.id,
        true,
        100
      );

      expect(stakingParams.upside).toBeGreaterThan(1);
      expect(stakingParams.upside).toBeLessThan(3); // Reasonable range

      // Place a large stake to shift probabilities
      await stakeService.createStake(testUser.id, testMarket.id, true, 500);

      // Now FALSE should have better upside
      const newStakingParams = await marketService.getStakingParameters(
        testMarket.id,
        false,
        100
      );

      expect(newStakingParams.upside).toBeGreaterThan(stakingParams.upside);
    });

    test('should track stake statistics correctly', async () => {
      // Create multiple stakes
      await stakeService.createStake(testUser.id, testMarket.id, true, 100);
      await stakeService.createStake(testUser.id, testMarket.id, false, 50);

      const userStakes = await stakeService.getUserStakes(testUser.id);
      expect(userStakes).toHaveLength(2);

      const totalStaked = userStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
      expect(totalStaked).toBe(150);
    });
  });

  describe('Market Resolution Integration', () => {
    test('should resolve market and distribute winnings correctly', async () => {
      // Create stakes on both sides
      const stake1 = await stakeService.createStake(testUser.id, testMarket.id, true, 100);
      
      const user2 = await TestSetup.createTestUser({
        provePoints: 500
      });
      
      const stake2 = await stakeService.createStake(user2.id, testMarket.id, false, 200);

      // Resolve market as TRUE
      await marketService.setMarketOutcome(testMarket.id, true);
      await marketService.resolveMarket(testMarket.id);

      // Check market resolution
      const resolvedMarket = await prisma.market.findUnique({
        where: { id: testMarket.id }
      });

      expect(resolvedMarket.closed).toBe(true);
      expect(resolvedMarket.outcome).toBe(true);

      // Check stakes are marked as resolved
      const resolvedStakes = await prisma.stake.findMany({
        where: { marketId: testMarket.id }
      });

      resolvedStakes.forEach((stake: any) => {
        expect(stake.resolved).toBe(true);
      });

      // Winner should have received payout
      const winningStake = resolvedStakes.find((s: any) => s.prediction === true);
      expect(winningStake.payout).toBeGreaterThan(winningStake.stakeAmount);

      // Loser should have payout of 0
      const losingStake = resolvedStakes.find((s: any) => s.prediction === false);
      expect(losingStake.payout).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid market ID gracefully', async () => {
      await expect(
        stakeService.createStake(testUser.id, 99999, true, 100)
      ).rejects.toThrow();
    });

    test('should handle invalid user ID gracefully', async () => {
      await expect(
        stakeService.createStake(99999, testMarket.id, true, 100)
      ).rejects.toThrow();
    });

    test('should prevent stakes on closed markets', async () => {
      // Close the market first
      await marketService.setMarketOutcome(testMarket.id, true);
      await marketService.resolveMarket(testMarket.id);

      await expect(
        stakeService.createStake(testUser.id, testMarket.id, true, 100)
      ).rejects.toThrow('Market is closed');
    });

    test('should handle zero and negative stake amounts', async () => {
      await expect(
        stakeService.createStake(testUser.id, testMarket.id, true, 0)
      ).rejects.toThrow();

      await expect(
        stakeService.createStake(testUser.id, testMarket.id, true, -50)
      ).rejects.toThrow();
    });
  });
});
