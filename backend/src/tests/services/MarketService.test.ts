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

  it('should calculate correct implied probabilities for 50/50 market', async () => {
    // Mock getMarketById to return a market with no shares
    marketService.getMarketById = jest.fn().mockResolvedValue({
      id: 1,
      sharesTrue: 0,
      sharesFalse: 0,
      stakes: []
    });
    const { probTrue, probFalse } = await marketService.getImpliedProbability(1);
    expect(probTrue).toBeCloseTo(0.5, 2);
    expect(probFalse).toBeCloseTo(0.5, 2);
  });

  it('should update odds after a stake', async () => {
    // Mock getImpliedProbability to return new odds
    marketService.getImpliedProbability = jest.fn().mockResolvedValue({ probTrue: 0.7, probFalse: 0.3 });
    await marketService.updateOdds(1, true, 10);
    expect(mockPrisma.market.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { probTrue: 0.7, probFalse: 0.3 },
    });
  });

  it('should calculate correct staking parameters for true prediction', async () => {
    marketService.getMarketById = jest.fn().mockResolvedValue({
      id: 1,
      sharesTrue: 0,
      sharesFalse: 0,
      stakes: []
    });
    const params = await marketService.getStakingParameters(1, true, 100);
    expect(params.upside).toBeCloseTo(1.9090, 3);
    expect(params.sharesBought).toBeCloseTo(190.90, 2);
  });

  it('should calculate correct staking parameters for false prediction', async () => {
    marketService.getMarketById = jest.fn().mockResolvedValue({
      id: 1,
      sharesTrue: 0,
      sharesFalse: 0,
      stakes: []
    });
    const params = await marketService.getStakingParameters(1, false, 100);
    expect(params.upside).toBeCloseTo(1.9090, 3);
    expect(params.sharesBought).toBeCloseTo(190.90, 2);
  });
});

