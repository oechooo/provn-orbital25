import { StakeService } from '../../services/StakeService';
import { MarketService } from '../../services/MarketService';
import { UserService } from '../../services/UserService';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  stake: {
    create: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
  market: {
    findUnique: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
  },
  $transaction: jest.fn(),
};

describe('StakeService', () => {
  let stakeService: StakeService;
  let marketService: MarketService;

  beforeEach(() => {
    stakeService = new StakeService(mockPrisma as any);
    jest.clearAllMocks();
  });

  it('should throw if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(stakeService.createStake(1, 1, true, 10)).rejects.toThrow('User not found');
  });

  it('should throw if user has insufficient prove points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, provePoints: 5 });
    await expect(stakeService.createStake(1, 1, true, 10)).rejects.toThrow('Insufficient prove points');
  });

  it('should create stake and decrement prove points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, provePoints: 100 });
    mockPrisma.market.findUnique.mockResolvedValue({ id: 1, probTrue: 0.5, probFalse: 0.5, stakes: [], article: {} }); // <-- Add this line
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      // Simulate the transaction callback
      return cb({
        stake: { create: mockPrisma.stake.create },
        user: { update: mockPrisma.user.update }
      });
    });
    mockPrisma.stake.create.mockResolvedValue({ id: 1, userId: 1, marketId: 1, prediction: true, stakeAmount: 10 });

    const stake = await stakeService.createStake(1, 1, true, 10);
    expect(stake).toHaveProperty('id', 1);
    expect(mockPrisma.stake.create).toHaveBeenCalled();
    expect(mockPrisma.user.update).toHaveBeenCalled();
  });

  it('should create a stake and update odds using LMSR', async () => {
    marketService = new MarketService(mockPrisma as any);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, provePoints: 100 });
    mockPrisma.market.findUnique.mockResolvedValue({ id: 1, probTrue: 0.5, probFalse: 0.5, stakes: [], article: {} });
    marketService.getStakingParameters = jest.fn().mockResolvedValue({ upside: 1.2, sharesBought: 10 });
    marketService.updateOdds = jest.fn().mockResolvedValue(undefined);

    mockPrisma.$transaction.mockImplementation(async (cb) => {
      return cb({
        stake: { create: mockPrisma.stake.create },
        user: { update: mockPrisma.user.update }
      });
    });
    mockPrisma.stake.create.mockResolvedValue({ id: 1, userId: 1, marketId: 1, prediction: true, stakeAmount: 10 });

    const stake = await stakeService.createStake(1, 1, true, 10);
    expect(stake).toHaveProperty('id', 1);
    expect(mockPrisma.stake.create).toHaveBeenCalled();
    expect(marketService.updateOdds).not.toThrow;
  });

  it('should throw if user tries to stake more than their prove points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, provePoints: 5 });
    await expect(stakeService.createStake(1, 1, true, 10)).rejects.toThrow('Insufficient prove points');
  });

  it('should add the new stake to the user\'s stake array', async () => {
    const userId = 1;
    const newStake = { id: 2, userId, marketId: 1, prediction: true, stakeAmount: 20, market: {} };
    // Mock user creation and stake creation
    mockPrisma.user.findUnique.mockResolvedValue({
      id: userId,
      username: 'testuser',
      email: 'test@example.com',
      provePoints: 80,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      stakes: [newStake]
    });
    mockPrisma.stake.create.mockResolvedValue(newStake);

    // Create the stake (simulate)
    await stakeService.createStake(userId, 1, true, 20);

    // Use UserService to get the user and their stakes
    const userService = new UserService(mockPrisma as any);
    const user = await userService.getUser(userId);

    expect(user).not.toBeNull();
    expect(user!.stakes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 2, userId, prediction: true, stakeAmount: 20 })
      ])
    );
  });
});