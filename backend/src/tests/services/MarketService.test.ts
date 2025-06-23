import { MarketService } from '../../services/MarketService';

const mockPrisma = {
  market: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  stake: {
    findMany: jest.fn(),
  },
  article: {
    findFirst: jest.fn(),
  }
};

describe('MarketService', () => {
  let marketService: MarketService;

  beforeEach(() => {
    marketService = new MarketService(mockPrisma as any);
    jest.clearAllMocks();
  });

  it('should create a market', async () => {
    // Mock article lookup to simulate an existing article without a market
    mockPrisma.article.findFirst.mockResolvedValue({ id: 1, market: null });
    mockPrisma.market.create.mockResolvedValue({ id: 1, resolved: false });
    const market = await marketService.createMarket(1);
    expect(market).toHaveProperty('id', 1);
    expect(mockPrisma.article.findFirst).toHaveBeenCalled();
    expect(mockPrisma.market.create).toHaveBeenCalled();
  });

  it('should get a market by id', async () => {
    mockPrisma.market.findUnique.mockResolvedValue({ id: 1, resolved: false, stakes: [] });
    const market = await marketService.getMarketById(1);
    expect(market).toHaveProperty('id', 1);
    expect(mockPrisma.market.findUnique).toHaveBeenCalled();
  });

  it('should reflect a new stake in the market stakes list', async () => {
    const initialMarket = {
      id: 1,
      resolved: false,
      stakes: [
        { id: 1, userId: 1, stakeAmount: 10, prediction: true }
      ]
    };

    mockPrisma.market.findUnique.mockResolvedValue(initialMarket);
    // Simulate adding a new stake (you may have a StakeService for this in reality)
    const newStake = { id: 2, userId: 2, stakeAmount: 20, prediction: false };
    initialMarket.stakes.push(newStake);
    mockPrisma.market.findUnique.mockResolvedValueOnce(initialMarket);

    const market = await marketService.getMarketById(1);
    expect(market).not.toBeNull();
    expect(market).toHaveProperty('stakes');
    expect(Array.isArray(market!.stakes)).toBe(true);
    expect(market!.stakes.length).toBe(2);
    expect(market!.stakes[1]).toMatchObject(newStake);
  });
});