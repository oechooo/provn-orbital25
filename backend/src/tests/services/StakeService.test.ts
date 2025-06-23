import { StakeService } from '../../services/StakeService';

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
  $transaction: jest.fn(),
};

describe('StakeService', () => {
  let stakeService: StakeService;

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
});